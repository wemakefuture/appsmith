import React, { useEffect, useMemo, useState } from "react";
import Dialog from "components/ads/DialogComponent";
import Button, { Size } from "components/ads/Button";
import styled from "styled-components";
import { getTypographyByKey } from "constants/DefaultTheme";
import Divider from "components/editorComponents/Divider";
import { FORK_APP } from "constants/messages";
import { useDispatch } from "react-redux";
import { getAllApplications } from "actions/applicationActions";
import { useSelector } from "store";
import { getUserApplicationsOrgs } from "selectors/applicationSelectors";
import { isPermitted, PERMISSION_TYPE } from "./permissionHelpers";
import RadioComponent from "components/ads/Radio";
import { ReduxActionTypes } from "constants/ReduxActionConstants";
import { Classes } from "@blueprintjs/core";

const TriggerButton = styled(Button)`
  ${(props) => getTypographyByKey(props, "btnLarge")}
  height: 100%;
  svg {
    transform: rotate(-90deg);
  }
  margin-right: ${(props) => props.theme.spaces[7]}px;
`;

const StyledDialog = styled(Dialog)`
  && .${Classes.DIALOG_BODY} {
    padding-top: 0px;
  }
`;

const StyledRadioComponent = styled(RadioComponent)`
  label {
    font-size: 16px;
    margin-bottom: 32px;
  }
`;

const ForkButton = styled(Button)`
  height: 38px;
  width: 203px;
`;

const OrganizationList = styled.div`
  overflow: auto;
  max-height: 250px;
  margin-bottom: 10px;
  margin-top: 20px;
`;

function ForkApplicationModal(props: any) {
  const [organizationId, selectOrganizationId] = useState("");
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllApplications());
  }, [dispatch, getAllApplications]);
  const userOrgs = useSelector(getUserApplicationsOrgs);

  const forkApplication = () => {
    dispatch({
      type: ReduxActionTypes.FORK_APPLICATION_INIT,
      payload: {
        applicationId: props.applicationId,
        organizationId,
      },
    });
  };

  const organizationList = useMemo(() => {
    const filteredUserOrgs = userOrgs.filter((item) => {
      const permitted = isPermitted(
        item.organization.userPermissions ?? [],
        PERMISSION_TYPE.CREATE_APPLICATION,
      );
      return permitted;
    });

    if (filteredUserOrgs.length) {
      selectOrganizationId(filteredUserOrgs[0].organization.id);
    }

    return filteredUserOrgs.map((org) => {
      return {
        label: org.organization.name,
        value: org.organization.id,
      };
    });
  }, [userOrgs]);

  return (
    <StyledDialog
      className={"fork-modal"}
      maxHeight={"540px"}
      title={"Select the organisation to fork"}
      trigger={
        <TriggerButton
          className="t--fork-app"
          icon="fork"
          size={Size.small}
          text={FORK_APP}
        />
      }
    >
      <Divider />
      {organizationList.length && (
        <OrganizationList>
          <StyledRadioComponent
            className={"radio-group"}
            columns={1}
            defaultValue={organizationList[0].value}
            onSelect={(value) => selectOrganizationId(value)}
            options={organizationList}
          />
        </OrganizationList>
      )}
      <ForkButton
        disabled={!organizationId}
        onClick={forkApplication}
        size={Size.large}
        text={"FORK"}
      />
    </StyledDialog>
  );
}

export default ForkApplicationModal;