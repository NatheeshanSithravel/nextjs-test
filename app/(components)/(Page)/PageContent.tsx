import { Paper, Stack, Typography } from '@mui/material'
import React from 'react'


interface Props {
    children?: React.ReactNode,
    title?: string,
    action?: React.ReactNode
}

export default function PageContent(props: Props) {
    return (
        <Stack m={2} p={2} component={Paper} sx={{marginBottom:'70px',overflowY:'scroll', borderRadius:'20px'}} >
            <Stack  mb={2}  direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                <Typography variant="h5">{props.title}</Typography>
                {props.action}
            </Stack>
            <Stack mb={2} direction={'column'} justifyContent={'space-between'} alignItems={'center'}>
                {props.children}
            </Stack>
        </Stack>
    )
}
