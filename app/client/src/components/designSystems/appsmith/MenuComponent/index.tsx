import * as React from "react";
import styled from "styled-components";
import { Alignment, Button, Icon, Menu, MenuItem } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import { IconName } from "@blueprintjs/icons";

import { ComponentProps } from "components/designSystems/appsmith/BaseComponent";
import { darkenActive, darkenHover } from "constants/DefaultTheme";

export const MenuContainer = styled.div`
  width: 100%;
  height: 100%;
  text-align: center;

  & > .bp3-popover2-target {
    height: 100%;
  }
`;

export interface BaseStyleProps {
  isCompact?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

const BaseButton = styled(Button)<BaseStyleProps>`
  height: 100%;
  overflow: hidden;
  border: 1.2px solid #ebebeb;
  border-radius: 0;
  box-shadow: none !important;
  ${({ backgroundColor }) =>
    backgroundColor &&
    `
      background-image: none !important;
      background-color: ${backgroundColor} !important;
      &:hover {
        background-color: ${darkenHover(backgroundColor)} !important;
      }
      &:active {
        background-color: ${darkenActive(backgroundColor)} !important;
      }
  `}
  ${({ textColor }) =>
    textColor &&
    `
      color: ${textColor} !important;
  `}
`;

const BaseMenuItem = styled(MenuItem)<BaseStyleProps>`
  ${({ backgroundColor }) =>
    backgroundColor &&
    `
      background-color: ${backgroundColor} !important;
      &:hover {
        background-color: ${darkenHover(backgroundColor)} !important;
      }
      &:active {
        background-color: ${darkenActive(backgroundColor)} !important;
      }
  `}
  ${({ textColor }) =>
    textColor &&
    `
      color: ${textColor} !important;
  `}
  ${({ isCompact }) =>
    isCompact &&
    `
      padding-top: 3px;
      padding-bottom: 3px;
      font-size: 12px;
  `}
`;

const StyledMenu = styled(Menu)`
  padding: 0;
`;

export interface PopoverContentProps {
  menuItems: Record<
    string,
    {
      widgetId: string;
      id: string;
      index: number;
      isVisible?: boolean;
      isDisabled?: boolean;
      label?: string;
      backgroundColor?: string;
      textColor?: string;
      iconName?: IconName;
      iconColor?: string;
      iconAlign?: Alignment;
      onClick?: string;
    }
  >;
  onItemClicked: (onClick: string | undefined) => void;
  isCompact?: boolean;
}

function PopoverContent(props: PopoverContentProps) {
  const { isCompact, menuItems: itemsObj, onItemClicked } = props;

  const items = Object.keys(itemsObj)
    .map((itemKey) => itemsObj[itemKey])
    .filter((item) => item.isVisible === true);

  const listItems = items.map((menuItem) => {
    const {
      backgroundColor,
      iconAlign,
      iconColor,
      iconName,
      id,
      isDisabled,
      label,
      onClick,
      textColor,
    } = menuItem;
    if (iconAlign === Alignment.RIGHT) {
      return (
        <BaseMenuItem
          backgroundColor={backgroundColor}
          disabled={isDisabled}
          isCompact={isCompact}
          key={id}
          labelElement={<Icon color={iconColor} icon={iconName} />}
          onClick={() => onItemClicked(onClick)}
          text={label}
          textColor={textColor}
        />
      );
    }
    return (
      <BaseMenuItem
        backgroundColor={backgroundColor}
        disabled={isDisabled}
        icon={<Icon color={iconColor} icon={iconName} />}
        isCompact={isCompact}
        key={id}
        onClick={() => onItemClicked(onClick)}
        text={label}
        textColor={textColor}
      />
    );
  });

  return <StyledMenu>{listItems}</StyledMenu>;
}

function ButtonNormal(props: PopoverTargetButtonProps) {
  const {
    backgroundColor,
    iconAlign,
    iconColor,
    iconName,
    label,
    textColor,
  } = props;

  if (iconAlign === Alignment.RIGHT) {
    return (
      <BaseButton
        alignText={iconName ? Alignment.LEFT : Alignment.CENTER}
        backgroundColor={backgroundColor}
        fill
        rightIcon={<Icon color={iconColor} icon={iconName} />}
        text={label}
        textColor={textColor}
      />
    );
  }

  return (
    <BaseButton
      alignText={iconName ? Alignment.RIGHT : Alignment.CENTER}
      backgroundColor={backgroundColor}
      fill
      icon={<Icon color={iconColor} icon={iconName} />}
      text={label}
      textColor={textColor}
    />
  );
}

export interface PopoverTargetButtonProps {
  label?: string;
  backgroundColor?: string;
  textColor?: string;
  iconName?: IconName;
  iconColor?: string;
  iconAlign?: Alignment;
}

function PopoverTargetButton(props: PopoverTargetButtonProps) {
  const {
    backgroundColor,
    iconAlign,
    iconColor,
    iconName,
    label,
    textColor,
  } = props;

  return (
    <ButtonNormal
      backgroundColor={backgroundColor}
      iconAlign={iconAlign}
      iconColor={iconColor}
      iconName={iconName}
      label={label}
      textColor={textColor}
    />
  );
}

export interface MenuComponentProps extends ComponentProps {
  label?: string;
  textColor?: string;
  isDisabled?: boolean;
  isVisible?: boolean;
  isCompact?: boolean;
  menuItems: Record<
    string,
    {
      widgetId: string;
      id: string;
      index: number;
      isVisible?: boolean;
      isDisabled?: boolean;
      label?: string;
      backgroundColor?: string;
      textColor?: string;
      iconName?: IconName;
      iconColor?: string;
      iconAlign?: Alignment;
      onClick?: string;
    }
  >;
  iconName?: IconName;
  iconColor?: string;
  iconAlign?: Alignment;
  onItemClicked: (onClick: string | undefined) => void;
}

function MenuComponent(props: MenuComponentProps) {
  const { isCompact, isDisabled, menuItems, onItemClicked } = props;

  return (
    <MenuContainer>
      <Popover2
        content={
          <PopoverContent
            isCompact={isCompact}
            menuItems={menuItems}
            onItemClicked={onItemClicked}
          />
        }
        disabled={isDisabled}
        fill
        minimal
        placement="bottom-end"
      >
        <PopoverTargetButton {...props} />
      </Popover2>
    </MenuContainer>
  );
}

export default MenuComponent;
