import { Button } from '@mui/material'
import React from 'react'

interface Props {
    onClick: () => void;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
}
export default function PrimaryButton(props: Props) {
    return (
        <Button
            disabled={props.disabled}
            size={props.size? props.size : 'large'}
            onClick={props.onClick}
            startIcon={props.icon}
            variant="contained"
            sx={{
                backgroundColor: 'rgb(57,163,244)',
                '&:hover': {
                    backgroundColor: 'rgb(36, 124, 192)',
                },
            }}
        >
            {props.label}
        </Button>
    )
}
