import { Box, Paper, Stack, Typography } from '@mui/material'
import React from 'react'

export default function AppFooter() {
    return (
        <Box
        elevation={4}
            component={Paper}
            sx={{
                width: '100%',
                height: '50px',
                position: 'fixed',
                left: 0,
                bottom: 0,
                padding: 2,
                color: "black",
                textAlign: "center",
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex:1
            }}
        >
            <Stack>
                <Typography variant="body2" fontWeight="400">2019 © Mobitel (Pvt) Ltd | mDistributor</Typography>
            </Stack>
        </Box>
    )
}
