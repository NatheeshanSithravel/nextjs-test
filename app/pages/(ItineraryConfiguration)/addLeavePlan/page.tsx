"use client"
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import CustomDatePicker from '@/app/(components)/(DatePicker)/CustomDatePicker';
import PageContent from '@/app/(components)/(Page)/PageContent'
import { UserRole } from '@/app/(enums)/UserRole';
import { retriewAllAvailableItinerary, saveAnualLeavePlan, saveItineraryTemplate } from '@/app/(services)/SFARestClient';
import { getRole, getToken } from '@/app/util/UserDataHandler';
import { FormControl, Grid2, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from '@mui/material'
import dayjs from 'dayjs';
import { redirect } from 'next/navigation';
import React, { useEffect, useLayoutEffect, useState } from 'react'

interface FieldErrors {
    description: string;
}


export default function AddLeavePlan() {

    /////////////////// New Validation /////////////////////
    const initialErrors: FieldErrors = {
        description: ""
    }

    const [fieldErrors, setfieldErrors] = useState<FieldErrors>({ ...initialErrors });

    const validateForm = () => {
        const newErrors: Partial<FieldErrors> = {};
        setfieldErrors(initialErrors);

        if (!description) {
            newErrors.description = "Description cannot be empty";
        } else if (description.trim().length == 0) {
            newErrors.description = "Description cannot be empty";
        } else if (description.length > 200) {
            newErrors.description = "Description cannot exceed 200 characters"
        }

    
        setfieldErrors((prevErrors) => ({
            ...prevErrors,
            ...newErrors,
        }));

        return Object.keys(newErrors).length === 0;
    }



    //////////////////// Alert ////////////////////////
    const [alert, setAlert] = useState<AlertProp>({
        open: false,
        type: "success",
        message: "",
    });

    const [reload, setReload] = useState<boolean>(false);

    //// init /////
    const [token, settoken] = useState<any>(null);
    const [role, setrole] = useState<any>(null);

    useEffect(() => {
        const getData = async () => {
            settoken(await getToken());
            setrole(await getRole());
        };
        getData();
    }, []);

    useEffect(() => {
        if (role != null) {
            if (!(role == UserRole.COOP_ADMIN ||
                role == UserRole.MANAGER ||
                role == UserRole.COORDINATOR ||
                role == UserRole.SALES_REP)) {
                redirect('/pages/dashboard')
            }
        }
    }, [role]);

    //////////////////////////////////////////////////

    ///////////////////// Attributes ///////////////////////
    const [leaveDate, setleaveDate] = useState<any>(dayjs(new Date()));
    const [description, setdescription] = useState<any>("");
    const [globleLeaveList, setglobleLeaveList] = useState<any[]>([]);

    //////////////////////// Init //////////////////////////
    useEffect(() => {

        const init = async () => {

        };

        if (token) {
            init();
        }
    }, [token, reload]);



    //////////////////Helpers///////////////
    const clearInputs = () => {
        setleaveDate(dayjs(new Date()));
        setdescription("");
        setglobleLeaveList([]);
    }

    /////////////////Methods///////////////
    const addLeaves = () => {

        if (!validateForm()) {
            return;
        }

        let leavesDTO: any = {};

        if (leaveDate == null || description.trim() === '') {
            setAlert({
                message: "Description Field Cannot be Empty.",
                open: true,
                type: "error",
            })
        } else {
            leavesDTO.leaveDate = dayjs(leaveDate).format("YYYY-MM-DD");
            leavesDTO.description = description;
            setglobleLeaveList([...globleLeaveList, leavesDTO])
            setleaveDate(dayjs(new Date()));
            setdescription("")
        }
    }

    const saveLeavePlan = async () => {
        let temp: any[] = [];
        for (let tempLeaves of globleLeaveList) {
            let leavesToSave: any = {};
            leavesToSave.leaveDay = tempLeaves.leaveDate;
            leavesToSave.description = tempLeaves.description;
            temp.push(leavesToSave)
        }

        const req: any = {
            tokenString: token,
            leavePlanList: temp
        }

        let res = await saveAnualLeavePlan(token, req);
        if (res.success === true) {
            clearInputs()
            setAlert({
                open: true,
                type: "success",
                message: "New leave plan has been successfully added.",
            });

        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Adding of new leave plan has been failed.",
            });
        }

    }




    //////// Table Pagination ///////////
    const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page
    const [tablePage, settablePage] = useState(0);
    const handleChangePage = (event: unknown, newPage: number) => {
        settablePage(newPage);
    };
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        settablePage(0);
    };

    ///////////////////// ERROR ////////////////////
    // const [errors, setErrors] = useState({
    //     description: false,
    // });

    // const validateForm = () => {
    //     const newErrors = {
    //         description: !description, // Check if Description is empty
    //     };

    //     setErrors(newErrors);

    //     return !Object.values(newErrors).some(error => error);
    // };


    return (
        <PageContent title="Add Leave Plan">
            <GlobalAlert alert={alert} setAlert={setAlert} />
            <Grid2 container spacing={2} width={'100%'} >
                <Grid2 size={{ xs: 12, md: 2 }} sx={{ display: 'flex', alignItems: 'center', maxWidth: '200px' }}>
                    <InputLabel sx={{ fontWeight: 'bold', }} >Leave Date *</InputLabel>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                    <CustomDatePicker
                        label='Leave Date *'
                        size={'small'}
                        value={leaveDate}
                        setvalue={setleaveDate}
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }} sx={{ display: 'flex', alignItems: 'center', maxWidth: '200px' }}>
                    <InputLabel sx={{ fontWeight: 'bold', }} >Description</InputLabel>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'center', }}>
                    <TextField
                        value={description || ""}
                        onChange={(e) => setdescription(e.target.value)}
                        fullWidth
                        variant='outlined'
                        label="Description *"
                        size='small'
                        error={Boolean(fieldErrors.description)}
                        helperText={fieldErrors.description}
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                    <Stack width={'100%'}>
                        <PrimaryButton label="Add Leave" onClick={addLeaves} />
                    </Stack>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                    <Stack width={'100%'}>
                        <PrimaryButton label="Submit" disabled={globleLeaveList.length == 0} onClick={saveLeavePlan} />
                    </Stack>
                </Grid2>
            </Grid2>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell ><strong>Date</strong></TableCell>
                            <TableCell><strong>Description</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {globleLeaveList
                            ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                            .map((row: any, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.leaveDate}</TableCell>
                                    <TableCell>{row.description}</TableCell>
                                </TableRow>
                            ))}

                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={globleLeaveList?.length || 0}
                    page={tablePage}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                />
            </TableContainer>
        </PageContent>
    )
}
