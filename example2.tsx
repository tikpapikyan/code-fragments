import Autocomplete, { AutocompleteProps, AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import React, { SyntheticEvent } from "react";

import { Chip } from "@mui/material";
import DhIcon from "../dh-icon/dh-icon";
import { DhIconType } from "../dh-icon/dh-icon.types";
import DhLabel from "../dh-label/dh-label";
import DhTooltip from "../dh-tooltip/dh-tooltip";
import { IOption } from "hooks/useTags";
import { StyledAutocompleteWrapper } from "./dh-autocomplete.styles";
import classNames from "classnames";

export interface IDhAutocomplete extends AutocompleteProps<IOption, true, false, true> {
    id: string;
    onChange: (values: SyntheticEvent<Element, Event>, value: IOption[] | IOption) => void;
    renderInput: (params: AutocompleteRenderInputParams) => React.ReactNode;
    label?: string | React.ReactNode;
    isFilter?: boolean;
}
const DhAutocomplete: React.FC<IDhAutocomplete> = ({ isFilter, label, disabled, ...props }) => {
    return (
        <StyledAutocompleteWrapper isFilter={isFilter} className={classNames("dh-autocomplete", props.className)}>
            {label && <DhLabel>{label}</DhLabel>}
            <Autocomplete
                className={classNames({
                    disabled,
                })}
                disableCloseOnSelect
                renderTags={(tagValue, getTagProps) => {
                    if (isFilter) {
                        const visibleTags = tagValue.slice(0, 2);
                        const extraCount = tagValue.length - 2;
                        return (
                            <>
                                {visibleTags.map((option, index) => (
                                    <DhTooltip key={option.label} title={option.label}>
                                        <Chip label={option.label} {...getTagProps({ index })} />
                                    </DhTooltip>
                                ))}
                                {extraCount > 0 && <Chip label={`+${extraCount} more`} />}
                            </>
                        );
                    }
                    return tagValue.map((option, index) => (
                        <DhTooltip key={option.label} title={option.label}>
                            <Chip label={option.label} {...getTagProps({ index })} />
                        </DhTooltip>
                    ));
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                popupIcon={<DhIcon type={DhIconType.ArrowDown} />}
                disablePortal
                {...props}
            />
        </StyledAutocompleteWrapper>
    );
};
export default DhAutocomplete;
