"use client"
import PageContent from '@/app/(components)/(Page)/PageContent'
import { FormControl, Grid2, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { addTemplateToMonth, createBranch, finAllRootPlans, findAllAreaHirachy, findUserAssignedTemplates, previewTemplateToMonth, retriewAllAvailableItinerary, retriewCompanyList, retriewItinTemplates } from '@/app/(services)/SFARestClient';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import CustomDatePicker from '@/app/(components)/(DatePicker)/CustomDatePicker';
import dayjs from 'dayjs';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import EventCalendar from './(components)/Calendar';
import AssignTemplateDialog from './(components)/AssignTemplateDialog';
import TemplateDialog from '../approveTemplate/(component)/TemplateDialog';
import { getRole, getToken } from '@/app/util/UserDataHandler';
import { UserRole } from '@/app/(enums)/UserRole';
import { redirect } from 'next/navigation';

interface EventCalendarProps {
    title: string;
    start: string;
    end?: string;
    id: number;
}


export default function AssignItinerarTemplate() {

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
                role == UserRole.COORDINATOR ||
                role == UserRole.SALES_REP)) {
                redirect('/pages/dashboard')
            }
        }
    }, [role]);

    const [globaleTemplateDTO, setglobaleTemplateDTO] = useState<any[]>([]);
    const [itineraryTemplateList, setitineraryTemplateList] = useState<any[]>([]);
    const [status, setstatus] = useState<any>("Pending");

    ////////////// init //////////////////
    const init = async () => {
        const res = await findUserAssignedTemplates(token, { tokenString: token, templateStatus: status })

        if (res?.success) {
            setglobaleTemplateDTO(res.templateItinDateMapDtoList)
        } else {
            setglobaleTemplateDTO([]);
        }

        const req = {
            tokenString: token,
            allItinerary: true
        }

        const res2 = await retriewAllAvailableItinerary(token, req);
        if (res2?.success) {
            setitineraryTemplateList(res2.itineraryTemplateList);
        } else {
            setitineraryTemplateList([]);
        }
    }

    useEffect(() => {
        if (token) {
            init();
        }
    }, [token, reload, status]);


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
        <PageContent title='Assign Itinerary Template' action={<AssignTemplateDialog reload={reload} setReload={setReload} />} >
            <Grid2 container width={'100%'} spacing={2} sx={{ alignItems: 'center' }} mb={2}>
                <Grid2 size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                            label="Status"
                            value={status}
                            onChange={(e) => { setstatus(e.target.value); }}

                        >
                            <MenuItem value={"Pending"}>Pending</MenuItem>
                            <MenuItem value={"Approved"}>Approved</MenuItem>
                            <MenuItem value={"Rejected"}>Rejected</MenuItem>
                        </Select>
                    </FormControl>
                </Grid2>
            </Grid2>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell ><strong>Template ID</strong></TableCell>
                            <TableCell ><strong>Template Name</strong></TableCell>
                            <TableCell ><strong>Action</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {globaleTemplateDTO
                            ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                            .map((row: any, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.templateId}</TableCell>
                                    <TableCell>{row.templateName}</TableCell>
                                    <TableCell>
                                        <Stack direction={'row'} spacing={1}>
                                            <TemplateDialog
                                                view={true}
                                                reload={reload}
                                                setReload={setReload}
                                                selectedTemplate={row}
                                                itineraryTemplateList={itineraryTemplateList}
                                            />
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}

                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={globaleTemplateDTO?.length || 0}
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
