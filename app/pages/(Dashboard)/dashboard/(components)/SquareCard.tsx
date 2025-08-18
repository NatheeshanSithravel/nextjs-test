import { InputLabel, Paper, Stack, Typography } from '@mui/material'
import React from 'react'

interface Props {
    bottomColor:string,
    topColor:string
    title:string;
    value:any;
}

export default function SquareCard({bottomColor, topColor, title, value} : Props) {
    return (
        <Stack direction={'column'} component={Paper} elevation={3} p={2} sx={{
            width: '100%',
            backgroundImage: `linear-gradient(to bottom, ${bottomColor}, ${topColor})`,
            height: '150px',
        }}
        >
            <InputLabel sx={{ color: 'white', fontWeight:'bold'}}>{title}</InputLabel>
            <Typography sx={{ color: 'white'}} variant='h2'>{value}</Typography>
        </Stack>
    )
}
