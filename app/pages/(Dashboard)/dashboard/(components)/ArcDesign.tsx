import * as React from 'react';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { InputLabel, Stack } from '@mui/material';



interface Props {
    title: string,
    color: string,
    value: number
}

export default function ArcDesign({ title, color, value }: Props) {
    const settings = {
        width: 200,
        height: 200,
        value: value,
    };
    return (
        <Stack sx={{ width: '100%' }} display={'flex'} direction={'column'} justifyContent={'center'} alignItems={'center'} >
            <InputLabel sx={{ fontWeight: 'bold', color: color }}>{title}</InputLabel>
            <Gauge

                {...settings}
                cornerRadius="50%"
                sx={(theme) => ({
                    [`& .${gaugeClasses.valueText}`]: {
                        fontSize: 40,
                    },
                    [`& .${gaugeClasses.valueArc}`]: {
                        fill: color,
                    },
                    [`& .${gaugeClasses.referenceArc}`]: {
                        fill: theme.palette.text.disabled,
                    },
                })}

            />
        </Stack>

    );
}
