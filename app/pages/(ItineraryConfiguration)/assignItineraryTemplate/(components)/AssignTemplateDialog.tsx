import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { Add, Close, Edit, Visibility } from '@mui/icons-material';
import { Alert, Button, CircularProgress, CSSObject, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, Grid, Grid2, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack, TextField } from '@mui/material';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import { addDistributorStore, addTemplateToMonth, addUser, createCompany, findAllAreaHirachy, findRootsByHierarchy, findSupervisorListByRole, getUmBranches, modifyCompany, previewTemplateToMonth, retriewAllAvailableItinerary, retriewAllROutPlans, retriewItinTemplates, retriewUserRoles, updateAllTemplatesToApprove, updateDisPoint, updateUser } from '@/app/(services)/SFARestClient';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from 'dayjs';
import CustomDatePicker from '@/app/(components)/(DatePicker)/CustomDatePicker';
import { getToken } from '@/app/util/UserDataHandler';

interface Props {
    ///// Common ////////
    setReload: Dispatch<SetStateAction<boolean>>;
    reload: boolean;

}


export default function AssignTemplateDialog({ setReload, reload }: Props) {


    //////////////////// Alert ////////////////////////
    const [alert, setAlert] = useState<AlertProp>({
        open: false,
        type: "success",
        message: "",
    });

    ///////////////////// Dialog Controls /////////////////////
    const [open, setopen] = useState(false);
    const [loading, setLoading] = useState(false);


    const closeDialog = () => {
        setopen(false)
        setErrors({
            templateID: false,
            startDate: false,
        });
    }

    const openDialog = () => {
        setopen(true)
    }



    const [token, settoken] = useState<any>(null);


    // useLayoutEffect(() => {
    //     if (typeof window !== "undefined") {
    //         settoken(sessionStorage.getItem("token"))
    //     }
    // }, []);
    useEffect(() => {
        const getData = async () => {
            settoken(await getToken());
        };
        getData();
    }, []);


    ///////////////////// Attributes ////////////////////
    const [templateList, settemplateList] = useState<any[]>([]);
    const [templateID, settemplateID] = useState<any>("");
    const [itineraryTemplateList, setitineraryTemplateList] = useState<any[]>([]);
    const [startDate, setstartDate] = useState<any>(dayjs(new Date()));
    const [calenderEventList, setcalenderEventList] = useState<any[]>([]);


    ///////////////////// Init ////////////////////////
    useEffect(() => {
        const init = async () => {
            const templateResponse = await retriewItinTemplates(token, { tokenString: token })
            if (templateResponse?.success === true) {
                settemplateList(templateResponse?.templateList)
            } else {
                settemplateList([])
            }

            const iteneryResponse = await retriewAllAvailableItinerary(token, { tokenString: token })
            if (iteneryResponse?.success === true) {
                setitineraryTemplateList(iteneryResponse?.itineraryTemplateList)
            } else {
                setitineraryTemplateList([])
            }
        }
        if (token) {
            init();
        }
    }, [token, reload]);



    //////////////////// Helpers /////////////////////
    const clearInputs = () => {

    }

    ////////////////////// ERRORS ///////////////////
    const [errors, setErrors] = useState({
        templateID: false,
        startDate: false,
    });

    const validateForm = () => {
        const newErrors = {
            templateID: !templateID, // Check if templateID is empty
            startDate: !startDate, // Check if startDate is empty
        };

        setErrors(newErrors);

        return !Object.values(newErrors).some(error => error);
    };

    ///////////////////// API CALLS /////////////////////



    const previewOccupyiedTemplate = async () => {
        if (!validateForm()) {
            return;
        }

        setcalenderEventList([])
        let req = {
            templateId: templateID,
            startDate: dayjs(startDate).format("YYYY-MM-DD"),
            tokenString: token
        }

        const leavePlanResponse = await previewTemplateToMonth(token, req);

        if (leavePlanResponse.success === true) {
            let temp: any[] = [];
            for (let tempMap of leavePlanResponse?.templateDateMapList) {
                let selectedItinerary = null;
                for (let tempItineraries of itineraryTemplateList) {
                    if (tempMap.itineraryId == tempItineraries.itineraryId) {
                        selectedItinerary = tempItineraries;

                        temp.push({
                            title: selectedItinerary?.itineraryName,
                            start: dayjs(tempMap?.startDate).format("YYYY-MM-DD"),
                            id: tempMap?.startDate + "-" + selectedItinerary?.itineraryName
                        })
                    }


                }
            }
            setcalenderEventList(temp)

        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Please Select a Itinerary Template",
            });
        }
    }

    const occupyTemplate = async () => {

        if (!validateForm()) {
            return;
        }

        setcalenderEventList([])
        let req = {
            templateId: templateID,
            startDate: dayjs(startDate).format("YYYY-MM-DD"),
            tokenString: token
        }

        const leavePlanResponse = await addTemplateToMonth(token, req);

        if (leavePlanResponse.success === true) {

            setAlert({
                open: true,
                type: "success",
                message: "New itinerary template has been successfully assigned.",
            });

        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Application of new itinerary template has been failed.",
            });
        }
    }





    return (
        <React.Fragment>
            <PrimaryButton label='Assin New Template' onClick={openDialog} icon={<Add />} />

            <Dialog open={open} sx={{ backdropFilter: 'blur(3px)' }} fullWidth maxWidth={'lg'}>
                <GlobalAlert alert={alert} setAlert={setAlert} />

                <Stack justifyContent={'space-between'} flexDirection={'row'}>
                    <DialogTitle variant="h5">
                        Assign New Template
                    </DialogTitle>
                    <DialogActions>
                        <IconButton onClick={closeDialog}>
                            <Close />
                        </IconButton>
                    </DialogActions>
                </Stack>
                <Divider />
                <DialogContent>
                    <Stack direction={'column'} width={'100%'} gap={2}>
                        <Grid2 container width={'100%'} spacing={3} display={'flex'} alignItems={'center'}>
                            <Grid2 size={{ xs: 12, md: 2 }}>
                                <InputLabel sx={{ fontWeight: 'bold' }}>Itinerary Template *</InputLabel>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 3 }}>
                                <FormControl size="small" fullWidth error={errors.templateID}>
                                    <InputLabel>Itinerary Template *</InputLabel>
                                    <Select
                                        label="Itinerary Template *"
                                        value={templateID || ""}
                                        variant="outlined"
                                        onChange={(e) => settemplateID(e.target.value)}
                                    >
                                        {templateList.map((item, index) => (
                                            <MenuItem key={index} value={item?.templateId}>{item?.templateName}</MenuItem>
                                        ))
                                        }
                                    </Select>
                                    <FormHelperText>
                                    {errors.templateID && <span>Itinerary Template is required</span>}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 2 }} sx={{ maxWidth: '90px' }}>
                                <InputLabel sx={{ fontWeight: 'bold' }}>Start Date *</InputLabel>
                            </Grid2>
                            <Grid2 size={{ xs: 12, md: 3 }}>
                                <CustomDatePicker
                                    label='Start Date *'
                                    size={'small'}
                                    value={startDate}
                                    setvalue={setstartDate}
                                />
                            </Grid2>
                        </Grid2>
                        <Stack width={'100%'} gap={1} direction={'row'} justifyContent={'start'}>
                            <PrimaryButton onClick={previewOccupyiedTemplate} label='Preview' />
                            <PrimaryButton disabled={calenderEventList.length == 0} onClick={occupyTemplate} label='Submit' />
                        </Stack>

                        {calenderEventList.length > 0 &&
                            <FullCalendar
                                // height={"85vh"}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} // Initialize calendar with required plugins.
                                initialView="dayGridMonth" // Initial view mode of the calendar.
                                editable={false} // Allow events to be edited.
                                selectable={true} // Allow dates to be selectable.
                                selectMirror={false} // Mirror selections visually.
                                dayMaxEvents={false} // Limit the number of events displayed per day.
                                initialEvents={calenderEventList} // Initial events loaded from local storage.
                            />
                        }
                    </Stack>
                </DialogContent>
            </Dialog>
        </React.Fragment >
    );
}
