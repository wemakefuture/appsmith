import React from "react";
// import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { reduxForm, InjectedFormProps, getFormValues } from "redux-form";
// import { Icon, Card } from "@blueprintjs/core";
import styled from "styled-components";
// import InfiniteScroll from "react-infinite-scroller";
import { DEFAULT_PROVIDER_OPTION } from "constants/ApiEditorConstants";
// import {
//   getCurlImportPageURL,
//   // getProviderTemplatesURL,
// } from "constants/routes";
// import { SAAS_EDITOR_URL } from "pages/Editor/SaaSEditor/constants";
import { AppState } from "reducers";
import { ActionDataState } from "reducers/entityReducers/actionsReducer";
import { getImportedCollections } from "selectors/applicationSelectors";
import { TemplateList } from "constants/collectionsConstants";
import {
  ProvidersDataArray,
  SearchResultsProviders,
} from "constants/providerConstants";
import {
  getProviders,
  getProvidersLoadingState,
} from "selectors/applicationSelectors";
import { getProviderCategories } from "selectors/editorSelectors";
import { fetchImportedCollections } from "actions/collectionAction";
import { API_HOME_SCREEN_FORM } from "constants/forms";
import {
  fetchProviders,
  fetchProviderCategories,
  fetchProvidersWithCategory,
  clearProviders,
  searchApiOrProvider,
} from "actions/providerActions";
import { Colors } from "constants/Colors";
// import CenteredWrapper from "components/designSystems/appsmith/CenteredWrapper";
import { BaseTextInput } from "components/designSystems/appsmith/TextInputComponent";
import { API_EDITOR_URL_WITH_SELECTED_PAGE_ID } from "constants/routes";
// import DropdownField from "components/editorComponents/form/fields/DropdownField";
// import Spinner from "components/editorComponents/Spinner";
// import CurlLogo from "assets/images/Curl-logo.svg";
import { FetchProviderWithCategoryRequest } from "api/ProvidersApi";
import { Plugin } from "api/PluginApi";
import { createNewApiAction, setCurrentCategory } from "actions/apiPaneActions";
import { EventLocation } from "utils/AnalyticsUtil";
import { getAppsmithConfigs } from "configs";
import { getAppCardColorPalette } from "selectors/themeSelectors";
// import { CURL } from "constants/AppsmithActionConstants/ActionConstants";
import CloseEditor from "components/editorComponents/CloseEditor";
import { TabComponent, TabProp } from "components/ads/Tabs";
// import { PluginType } from "entities/Action";
import { IconSize } from "components/ads/Icon";
import NewApiScreen from "./NewApi";
const { enableRapidAPI } = getAppsmithConfigs();

const SearchContainer = styled.div`
  display: flex;
  width: 100%;
  .closeBtn {
    position: absolute;
    left: 70%;
  }
`;

const SearchBar = styled(BaseTextInput)`
  margin-bottom: 10px;
  input {
    background-color: ${Colors.WHITE};
    border: 1px solid ${Colors.GEYSER};
  }
`;

const HeaderFlex = styled.div`
  display: flex;
  align-items: center;
  & > p {
    margin: 0 0 0 8px;
  }
`;

const ApiHomePage = styled.div`
  font-size: 20px;
  padding: 20px;
  /* margin-left: 10px; */
  min-height: 95vh;
  max-height: 95vh;
  overflow: auto;
  padding-bottom: 50px;
  .closeBtn {
    position: absolute;
    left: 70%;
  }
  .searchResultsContainer {
    background-color: ${Colors.WHITE};
    z-index: 9999;
    width: 70%;
    padding: 20px;
    border: 1px solid ${Colors.ALTO};
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
    position: absolute;
    border-radius: 4px;
    max-height: 80vh;
    overflow: auto;
  }
  .searchCloseBtn {
    float: right;
    cursor: pointer;
  }
  .bp3-collapse-body {
    position: absolute;
    z-index: 99999;
    background-color: ${Colors.WHITE};
    border: 1px solid ${Colors.ALTO};
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    width: 100%;
    padding: 20px;
  }
  .fontSize16 {
    font-size: 16px;
  }
`;

const MainTabsContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const SectionGrid = styled.div`
  margin-top: 36px;
  display: grid;
  grid-template-columns: 1fr 180px;
  gap: 10px;
`;

type ApiHomeScreenProps = {
  initialValues: {
    category: string;
  };
  currentCategory: string;
  importedCollections: TemplateList[];
  fetchImportedCollections: () => void;
  providers: ProvidersDataArray[];
  fetchProviders: () => void;
  clearProviders: () => void;
  fetchProviderCategories: () => void;
  searchApiOrProvider: (searchKey: string) => void;
  providerCategories: string[];
  apiOrProviderSearchResults: {
    providers: SearchResultsProviders[];
  };
  pageId: string;
  plugins: Plugin[];
  applicationId: string;
  actions: ActionDataState;
  fetchProvidersWithCategory: (
    request: FetchProviderWithCategoryRequest,
  ) => void;
  location: {
    search: string;
  };
  match: {
    url: string;
  };
  history: {
    replace: (data: string) => void;
    push: (data: string) => void;
  };
  isFetchingProviders: boolean;
  providersTotal: number;
  isSwitchingCategory: boolean;
  createNewApiAction: (pageId: string, from: EventLocation) => void;
  setCurrentCategory: (category: string) => void;
  previouslySetCategory: string;
  fetchProvidersError: boolean;
  colorPalette: string[];
};

type ApiHomeScreenState = {
  page: number;
  showSearchResults: boolean;
  activePrimaryMenuId: number;
  activeSecondaryMenuId: number;
};

type Props = ApiHomeScreenProps &
  InjectedFormProps<{ category: string }, ApiHomeScreenProps>;

const PRIMARY_MENU: TabProp[] = [
  {
    key: "ACTIVE",
    title: "Active",
    panelComponent: <div />,
  },
  {
    key: "CREATE_NEW",
    title: "Create New",
    panelComponent: <div />,
    icon: "plus",
    iconSize: IconSize.XS,
  },
];

const SECONDARY_MENU: TabProp[] = [
  {
    key: "MOST_USED",
    title: "Most Used",
    panelComponent: <div />,
  },
  {
    key: "API",
    title: "API",
    panelComponent: <div />,
  },
  {
    key: "DATABASE",
    title: "Database",
    panelComponent: <div />,
  },
  {
    key: "SAAS",
    title: "SaaS Integrations",
    panelComponent: <div />,
  },
];

class ApiHomeScreen extends React.Component<Props, ApiHomeScreenState> {
  constructor(props: Props) {
    super(props);

    this.state = {
      page: 1,
      showSearchResults: false,
      activePrimaryMenuId: 0,
      activeSecondaryMenuId: 0,
    };
  }

  onSelectPrimaryMenu = (activePrimaryMenuId: number) => {
    this.setState({ activePrimaryMenuId });
  };

  onSelectSecondaryMenu = (activeSecondaryMenuId: number) => {
    this.setState({ activeSecondaryMenuId });
  };

  componentDidMount() {
    const {
      importedCollections,
      providerCategories,
      providersTotal,
    } = this.props;
    if (providerCategories.length === 0 && enableRapidAPI) {
      this.props.fetchProviderCategories();
    }
    if (importedCollections.length === 0 && enableRapidAPI) {
      this.props.fetchImportedCollections();
    }
    if (!providersTotal && enableRapidAPI) {
      this.props.clearProviders();
      this.props.change("category", DEFAULT_PROVIDER_OPTION);
      this.props.fetchProvidersWithCategory({
        category: DEFAULT_PROVIDER_OPTION,
        page: 1,
      });
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.currentCategory !== this.props.currentCategory &&
      this.props.currentCategory !== this.props.previouslySetCategory &&
      enableRapidAPI
    ) {
      this.props.setCurrentCategory(this.props.currentCategory);
      this.props.clearProviders();
      this.props.fetchProvidersWithCategory({
        category: this.props.currentCategory,
        page: 1,
      });
    }
  }

  handleCreateNew = () => {
    const pageId = new URLSearchParams(this.props.location.search).get(
      "importTo",
    );
    if (pageId) {
      this.props.createNewApiAction(pageId, "API_PANE");
    }
  };

  handleSearchChange = (e: React.ChangeEvent<{ value: string }>) => {
    const { searchApiOrProvider } = this.props;
    const value = e.target.value;
    if (value) {
      searchApiOrProvider(value);
      this.setState({ showSearchResults: true });
    } else {
      this.setState({ showSearchResults: false });
    }
  };

  handleFetchMoreProviders = (page: number) => {
    const { currentCategory } = this.props;
    this.props.fetchProvidersWithCategory({
      category: currentCategory,
      page: page,
    });
  };

  render() {
    const {
      // importedCollections,
      // apiOrProviderSearchResults,
      applicationId,
      // fetchProvidersError,
      history,
      // isSwitchingCategory,
      // isFetchingProviders,
      location,
      pageId,
      // providerCategories,
      // providers,
      // providersTotal,
    } = this.props;
    const { showSearchResults } = this.state;

    let destinationPageId = new URLSearchParams(location.search).get(
      "importTo",
    );

    if (!destinationPageId) {
      destinationPageId = pageId;
      history.push(
        API_EDITOR_URL_WITH_SELECTED_PAGE_ID(applicationId, pageId, pageId),
      );
    }

    return (
      <ApiHomePage
        className="t--apiHomePage"
        style={{ overflow: showSearchResults ? "hidden" : "auto" }}
      >
        <HeaderFlex>
          <CloseEditor />
          <p className="sectionHeadings">Integrations</p>
        </HeaderFlex>
        <SectionGrid>
          <MainTabsContainer>
            <TabComponent
              onSelect={this.onSelectPrimaryMenu}
              selectedIndex={this.state.activePrimaryMenuId}
              tabs={PRIMARY_MENU}
            />
          </MainTabsContainer>
          {/* TODO: make this search bar work */}
          <SearchContainer>
            <SearchBar
              icon="search"
              input={{
                onChange: this.handleSearchChange,
                onFocus: (e) => {
                  if (e.target.value) {
                    this.setState({ showSearchResults: true });
                  } else {
                    this.setState({ showSearchResults: false });
                  }
                },
              }}
              placeholder="Search"
            />
          </SearchContainer>

          <NewApiScreen
            applicationId={applicationId}
            history={history}
            location={location}
            pageId={pageId}
          />

          <TabComponent
            onSelect={this.onSelectSecondaryMenu}
            selectedIndex={this.state.activeSecondaryMenuId}
            tabs={SECONDARY_MENU}
            vertical
          />
        </SectionGrid>
      </ApiHomePage>
    );
  }
}

const mapStateToProps = (state: AppState) => {
  const { providers } = state.ui;
  const {
    apiOrProviderSearchResults,
    fetchProvidersError,
    isSwitchingCategory,
    providersTotal,
  } = providers;
  const formData = getFormValues(API_HOME_SCREEN_FORM)(
    state,
  ) as FetchProviderWithCategoryRequest;
  let category = DEFAULT_PROVIDER_OPTION;

  if (formData) {
    category = formData.category;
  }

  let initialCategoryValue;
  if (state.ui.apiPane.currentCategory === "") {
    initialCategoryValue = DEFAULT_PROVIDER_OPTION;
  } else {
    initialCategoryValue = state.ui.apiPane.currentCategory;
  }

  return {
    currentCategory: category,
    importedCollections: getImportedCollections(state),
    providers: getProviders(state),
    isFetchingProviders: getProvidersLoadingState(state),
    actions: state.entities.actions,
    providersTotal,
    providerCategories: getProviderCategories(state),
    plugins: state.entities.plugins.list,
    isSwitchingCategory,
    apiOrProviderSearchResults,
    previouslySetCategory: state.ui.apiPane.currentCategory,
    initialValues: { category: initialCategoryValue },
    fetchProvidersError,
    colorPalette: getAppCardColorPalette(state),
  };
};

const mapDispatchToProps = (dispatch: any) => ({
  fetchImportedCollections: () => dispatch(fetchImportedCollections()),
  fetchProviders: () => dispatch(fetchProviders()),
  clearProviders: () => dispatch(clearProviders()),
  fetchProviderCategories: () => dispatch(fetchProviderCategories()),
  fetchProvidersWithCategory: (request: FetchProviderWithCategoryRequest) =>
    dispatch(fetchProvidersWithCategory(request)),
  searchApiOrProvider: (searchKey: string) =>
    dispatch(searchApiOrProvider({ searchKey })),
  createNewApiAction: (pageId: string, from: EventLocation) =>
    dispatch(createNewApiAction(pageId, from)),
  setCurrentCategory: (category: string) =>
    dispatch(setCurrentCategory(category)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(
  reduxForm<{ category: string }, ApiHomeScreenProps>({
    form: API_HOME_SCREEN_FORM,
  })(ApiHomeScreen),
);
