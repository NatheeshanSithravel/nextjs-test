import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { Dayjs } from 'dayjs'
import React from 'react'

interface Props {
    value: Dayjs | null
    setvalue: React.Dispatch<React.SetStateAction<Dayjs | null>>
    label: string
    size: any
    minDate?: Dayjs
    maxDate?: Dayjs
    disabled?: boolean
}

export default function CustomDatePicker(props: Props) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                disabled={props.disabled}
                value={props.value}
                onChange={(newValue) => props.setvalue(newValue)}
                label={props.label}
                slotProps={{
                    textField: { size: props.size, fullWidth: true },
                    openPickerIcon: {
                        // color: 'primary',
                    }
                }}
                minDate={props.minDate}
                maxDate={props.maxDate}


            />
        </LocalizationProvider>
    )
}
