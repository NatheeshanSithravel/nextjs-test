import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { Add, Close, Edit, Visibility } from '@mui/icons-material';
import { Alert, Button, CircularProgress, CSSObject, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid, Grid2, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack, TextField } from '@mui/material';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import { addDistributorStore, addUser, createCompany, findAllAreaHirachy, findRootsByHierarchy, findSupervisorListByRole, getUmBranches, modifyCompany, retriewAllROutPlans, retriewUserRoles, updateAllTemplatesToApprove, updateDisPoint, updateUser } from '@/app/(services)/SFARestClient';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from 'dayjs';
import { getToken } from '@/app/util/UserDataHandler';

interface Props {
    ///// Common ////////
    setReload: Dispatch<SetStateAction<boolean>>;
    edit?:boolean;
    view?:boolean;
    reload: boolean;
    //////// Spceific////////////
    selectedTemplate: any;
    itineraryTemplateList:any[]
}


export default function TemplateDialog({ selectedTemplate,itineraryTemplateList, setReload, reload, view, edit }: Props) {


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
    }

    const openDialog = () => {
        setopen(true)
    }


    /////////////////// Common Attributes //////////////////
    const [token, settoken] = useState<any>(null);

    useEffect(() => {
        const getData = async () => {
            settoken(await getToken());
        };
        getData();
    }, []);

    // useLayoutEffect(() => {
    //     if (typeof window !== "undefined") {
    //         settoken(sessionStorage.getItem("token"))
    //         setcompanyId(sessionStorage.getItem("token")?.split(":")[4])
    //     }
    // }, []);

    ///////////////////// Attributes /////////////////////
    const [calenderEventList, setcalenderEventList] = useState<any[]>([]);



    ///////////////////// Inits /////////////////////
    useEffect(() => {
        if (selectedTemplate && itineraryTemplateList.length > 0) {
            previewOccupyiedTemplate();
            console.log(selectedTemplate)
        }
    }, [selectedTemplate, itineraryTemplateList]);

    ///////////////////// Helper Methods /////////////////////

    const clearInputs = () => {

    };

    const setInputs = () => {

    }




    ///////////////////// API Calls /////////////////////
    const approveTemplates = async () => {
        const listToSave = selectedTemplate.itinTemplateDateMapList.map((m: any) => ({
            ...m,
            approvalStatus: "Approved"
        }));

        const tempRequest = {
            tokenString: token,
            itintemplateDateMapList: listToSave
        };

        try {
            const tempResponse = await updateAllTemplatesToApprove(token,tempRequest);
            if (tempResponse.success) {
                setAlert({
                    open: true,
                    type: "success",
                    message: "Itinerary template has been successfully approved."
                });
                setReload(!reload);
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: `Approval of Itinerary template has been failed. (${tempResponse.message}).`
                });
            }
        } catch (error) {
            setAlert({
                open: true,
                type: "error",
                message: "Something went wrong. Please contact admin."
            });
        }
    };

    const rejectTemplates = async () => {
        const listToSave = selectedTemplate.itinTemplateDateMapList.map((m: any) => ({
            ...m,
            approvalStatus: "Rejected"
        }));

        const tempRequest = {
            tokenString: token,
            itintemplateDateMapList: listToSave
        };

        try {
            const tempResponse = await updateAllTemplatesToApprove(token,tempRequest);
            if (tempResponse.success) {
                setAlert({
                    open: true,
                    type: "success",
                    message: "Successfully rejected the Monthly plan."
                });
                setTimeout(() => {
                    setReload(!reload);
                }, 3000);
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: `Something went wrong (${tempResponse.message}). Please contact admin.`
                });
            }
        } catch (error) {
            setAlert({
                open: true,
                type: "error",
                message: "Something went wrong. Please contact admin."
            });
        }
    };


    const previewOccupyiedTemplate = async () => {
        setcalenderEventList([])

        let temp: any[] = [];
        for (let tempMap of selectedTemplate?.itinTemplateDateMapList) {
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
    }






    return (
        <React.Fragment>
            {edit && <IconButton onClick={openDialog}><Edit /></IconButton>}
            {view && <IconButton onClick={openDialog}><Visibility /></IconButton>}

            <Dialog open={open} sx={{ backdropFilter: 'blur(3px)' }} fullWidth maxWidth={'lg'}>
                <GlobalAlert alert={alert} setAlert={setAlert} />

                <Stack justifyContent={'space-between'} flexDirection={'row'}>
                    <DialogTitle variant="h5">
                        Itinerary Template ID - {selectedTemplate.templateId} ({selectedTemplate.templateName})
                    </DialogTitle>
                    <DialogActions>
                        <IconButton onClick={closeDialog}>
                            <Close />
                        </IconButton>
                    </DialogActions>
                </Stack>
                <Divider />
                <DialogContent>
                    <Stack>

                        {calenderEventList.length > 0 &&
                            <FullCalendar
                                initialDate={calenderEventList[0]?.start || dayjs().format("YYYY-MM-DD")}
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

                        <Stack alignItems={"end"} mt={2} flexDirection={'row-reverse'} gap={1}>
                            {loading ? <CircularProgress color="secondary" /> : edit &&
                                <React.Fragment>
                                    <Button variant='contained' color='success' onClick={approveTemplates}>Approve</Button>
                                    <Button variant='contained' color='error' onClick={rejectTemplates}> Reject</Button>
                                </React.Fragment>
                            }
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>
        </React.Fragment >
    );
}
