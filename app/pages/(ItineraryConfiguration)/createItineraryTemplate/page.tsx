"use client"
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import PageContent from '@/app/(components)/(Page)/PageContent'
import { UserRole } from '@/app/(enums)/UserRole';
import { retriewAllAvailableItinerary, saveItineraryTemplate } from '@/app/(services)/SFARestClient';
import { getRole, getToken } from '@/app/util/UserDataHandler';
import { FormControl, FormHelperText, Grid2, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from '@mui/material'
import { redirect } from 'next/navigation';
import React, { useEffect, useLayoutEffect, useState } from 'react'


interface FieldErrors {
    templateName: string;
    selectedItinerary: string;
}


export default function CreateItineraryTemplate() {


    /////////////////// New Validation /////////////////////
    const initialErrors: FieldErrors = {
        templateName: "",
        selectedItinerary: ""
    }

    const [fieldErrors, setfieldErrors] = useState<FieldErrors>({ ...initialErrors });

    const validateForm = () => {
        const newErrors: Partial<FieldErrors> = {};
        setfieldErrors(initialErrors);

        if (!templateName) {
            newErrors.templateName = "Template name cannot be empty";
        } else if (templateName.trim().length == 0) {
            newErrors.templateName = "Template name cannot be empty";
        } else if (templateName.length > 50) {
            newErrors.templateName = "Template name cannot exceed 50 characters"
        } 

        if (!selectedItinerary) {
            newErrors.selectedItinerary = "Itinerary for the Day is required";
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
            if (!(role == UserRole.COOP_ADMIN || role == UserRole.SALES_REP || role == UserRole.COORDINATOR)) {
                redirect('/pages/dashboard')
            }
        }
    }, [role]);

    ///////////////////// ERRORS //////////////////////////
    // const [errors, setErrors] = useState({
    //     templateName: false,
    //     selectedItinerary: false,
    // });

    // const validateForm = () => {
    //     const newErrors = {
    //         templateName: !templateName.trim(), // Check if Template Name is empty
    //         selectedItinerary: !selectedItinerary,
    //     };

    //     setErrors(newErrors);

    //     return !Object.values(newErrors).some(error => error);
    // };

    ///////////////////// Attributes ///////////////////////
    const [templateName, settemplateName] = useState<any>("");
    const [selectedItinerary, setselectedItinerary] = useState<any>("");
    const [itineraryTemplateList, setitineraryTemplateList] = useState<any[]>([]);
    const [orderedList, setorderedList] = useState<any[]>([]);

    //////////////////////// Init //////////////////////////
    useEffect(() => {

        const init = async () => {
            const iteneryResponse = await retriewAllAvailableItinerary(token, { tokenString: token })
            if (iteneryResponse.success === true) {
                setitineraryTemplateList(iteneryResponse.itineraryTemplateList)
            } else {
                setitineraryTemplateList([])
            }
        };

        if (token) {
            init();
        }
    }, [token, reload]);


    const addLeaves = () => {

        if (!validateForm()) {
            return;
        }

        let selectedTempItinerary = null;
        let leavesDTO: any = {};



        if (selectedItinerary == null || selectedItinerary === '') {
            setAlert({
                message: "Please select an Itinerary before add",
                open: true,
                type: "error",
            })
        } else {
            let listSize: number = orderedList.length;
            leavesDTO.eventNumber = `Day ${listSize + 1}`

            for (let tempItinerary of itineraryTemplateList) {
                if (tempItinerary.itineraryId == selectedItinerary) {
                    selectedTempItinerary = tempItinerary;
                }
            }

            leavesDTO.itineraryForTheDay = selectedTempItinerary;
            orderedList.push(leavesDTO);
            setselectedItinerary("");
        }
    }

    const addItineraryTemplate = async () => {
        let tempTemplate: any = {};
        let tempDateMapList: any[] = [];

        tempTemplate.templateName = templateName;

        let selectedItn: any = {}

        for (let itineraryTemp of orderedList) {
            selectedItn = itineraryTemp.itineraryForTheDay;
            let itinID = selectedItn.itineraryId;
            let tempDateMap: any = {};
            tempDateMap.itineraryId = itinID;
            tempDateMapList.push(tempDateMap);
        }

        let req = {
            tokenString: token,
            itineraryTemplate: tempTemplate,
            itintemplateDateMapList: tempDateMapList
        }

        let res = await saveItineraryTemplate(token, req);

        if (res.success === true) {
            clearInputs();
            setAlert({
                message: "New itinerary template has been successfully created.",
                open: true,
                type: "success"
            })
        } else {
            setAlert({
                message: "Creation of new itinerary template has been failed.",
                open: true,
                type: "success"
            })
        }
    }


    //////////////////Helpers///////////////
    const clearInputs = () => {
        settemplateName("");
        setselectedItinerary("");
        setorderedList([]);
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


    return (
        <PageContent title="Create Itinerary Template">
            <GlobalAlert alert={alert} setAlert={setAlert} />
            <Grid2 container spacing={2} width={'100%'} >
                <Grid2 size={{ xs: 12, md: 2 }} sx={{ display: 'flex', alignItems: 'center', maxWidth: '200px' }}>
                    <InputLabel sx={{ fontWeight: 'bold', }} >Template Name*</InputLabel>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 10 }}>
                    <TextField
                        value={templateName || ""}
                        onChange={(e) => settemplateName(e.target.value)}
                        variant="outlined"
                        fullWidth
                        size='small'
                        error={Boolean(fieldErrors.templateName)}
                        helperText={fieldErrors.templateName}
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }} sx={{ display: 'flex', alignItems: 'center', maxWidth: '200px' }}>
                    <InputLabel sx={{ fontWeight: 'bold', }} >Itinerary for the Day</InputLabel>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 5 }} sx={{ display: 'flex', alignItems: 'center', }}>
                    <FormControl fullWidth size="small" error={Boolean(fieldErrors.selectedItinerary)}>
                        <InputLabel>Itinerary for the Day</InputLabel>
                        <Select
                            label="Itinerary for the Day"
                            value={selectedItinerary || ""}
                            variant="outlined"
                            onChange={(e) => setselectedItinerary(e.target.value)}
                        >
                            {itineraryTemplateList?.map((item =>
                                <MenuItem key={item.itineraryId} value={item.itineraryId}>{item.itineraryName} - {item.itineraryId}</MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>
                            {fieldErrors.selectedItinerary}
                        </FormHelperText>
                    </FormControl>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                    <Stack width={'100%'}>
                        <PrimaryButton label="Add Itinerary" onClick={addLeaves} />
                    </Stack>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                    <Stack width={'100%'}>
                        <PrimaryButton label="Submit" disabled={orderedList.length == 0} onClick={addItineraryTemplate} />
                    </Stack>
                </Grid2>
            </Grid2>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell ><strong>Day Number</strong></TableCell>
                            <TableCell><strong>Selected Itinerary</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orderedList
                            ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                            .map((row: any, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.eventNumber}</TableCell>
                                    <TableCell>{row.itineraryForTheDay?.itineraryName}</TableCell>
                                </TableRow>
                            ))}

                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={orderedList?.length || 0}
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
