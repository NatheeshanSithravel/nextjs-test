"use client"
import PageContent from '@/app/(components)/(Page)/PageContent'
import { Grid2, Typography } from '@mui/material'
import React from 'react'
import SquareCard from './(components)/SquareCard'
import ArcDesign from './(components)/ArcDesign'

export default function Dashboard() {
    return (
        <PageContent>
            <Grid2 container sx={{ width: '100%' }} spacing={2}>
                <Grid2 size={{ xs: 12, md: 3, lg: 3 }}>
                    <SquareCard
                        bottomColor='#39a3f4'
                        topColor='#279cf5'
                        title='ALL SYSTEM USERS'
                        value={52}
                    />
                </Grid2>     
                <Grid2 size={{ xs: 12, md: 3, lg: 3 }}>
                    <SquareCard
                        bottomColor='#76be45'
                        topColor='#66b92d'
                        title='ALL SHOPS COUNT'
                        value={44}
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3, lg: 3 }}>
                    <SquareCard
                        bottomColor='#dea242'
                        topColor='#d5942e'
                        title='LOGGED IN COUNT'
                        value={2}
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3, lg: 3 }}>
                    <SquareCard
                        bottomColor='#d67161'
                        topColor='#d65c49'
                        title='DEALERS COUNT'
                        value={17}
                    />
                </Grid2>
            </Grid2>
            <Typography variant='h6' my={2}>Monthly Status</Typography>
            <Grid2 container sx={{ width: '100%' }} spacing={2}>
                <Grid2 size={{ xs: 12, md: 6, lg: 3 }}>
                    <ArcDesign
                    color='#6ebc3b'
                    title='People on Road'
                    value={12}
                    />
                </Grid2>     
                <Grid2 size={{ xs: 12, md: 6, lg: 3 }}>
                    <ArcDesign
                    color='#f6a821'
                    title='Location Hits'
                    value={12}
                    />
                </Grid2> 
                <Grid2 size={{ xs: 12, md: 6, lg: 3 }}>
                    <ArcDesign
                    color='#39a3f4'
                    title='Supervisors'
                    value={12}
                    />
                </Grid2> 
                <Grid2 size={{ xs: 12, md: 6, lg: 3 }}>
                    <ArcDesign
                    color='#EF5350'
                    title='Daily Sales'
                    value={12}
                    />
                </Grid2> 
            </Grid2>
        </PageContent>
    )
}
