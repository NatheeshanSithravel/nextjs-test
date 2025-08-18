import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { Add, Close, Edit, Visibility } from '@mui/icons-material';
import { Alert, Button, CircularProgress, CSSObject, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid, Grid2, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack, TextField } from '@mui/material';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import { addDistributorStore, addUser, createCompany, findAllAreaHirachy, findRootsByHierarchy, findSupervisorListByRole, getUmBranches, modifyCompany, retriewAllROutPlans, retriewUserRoles, updateDisPoint, updateUser } from '@/app/(services)/SFARestClient';
import { getCompanyID, getToken } from '@/app/util/UserDataHandler';
import { emailRegex, mobileRegex } from '@/app/regex';

interface Props {
    ///// Common ////////
    view?: boolean;
    edit?: boolean;
    create?: boolean;
    setReload: Dispatch<SetStateAction<boolean>>;
    reload: boolean;
    //////// Spceific////////////
    company?: any;
}

interface FieldErrors {
    cid: string;
    name: string;
    addOne: string;
    addTwo: string;
    city: string;
    brcCode: string;
    accManager: string;
    accManagerEmail: string;
    accCode: string;
    billingCOde: string;
    contactNo: string;
    email: string;
    vatNo: string;
    dbConfigKey: string;
}

export default function CompanyDialog({ company, view, edit, create, setReload, reload }: Props) {

    /////////////////// New Validation /////////////////////
    const initialErrors: FieldErrors = {
        cid: "",
        name: "",
        addOne: "",
        addTwo: "",
        city: "",
        brcCode: "",
        accManager: "",
        accManagerEmail: "",
        accCode: "",
        billingCOde: "",
        contactNo: "",
        email: "",
        vatNo: "",
        dbConfigKey: "",
    }

    const [fieldErrors, setfieldErrors] = useState<FieldErrors>({ ...initialErrors });

    const validateForm = () => {
        const newErrors: Partial<FieldErrors> = {};
        setfieldErrors(initialErrors); 

        if (!cid) {
            newErrors.cid = "Company id cannot be empty";
        } else if (cid < 1) {
            newErrors.cid = "Company id cannot be 0";
        } else if (cid > 999999) {
            newErrors.cid = "Company id cannot exceed 999999"
        }


        if (!name) {
            newErrors.name = "Company name cannot be empty";
        } else if (name.trim().length == 0) {
            newErrors.name = "Company name cannot be empty";
        } else if (name.length > 50) {
            newErrors.name = "Company name cannot exceed 50 characters"
        }

        if (!addOne) {
            newErrors.addOne = "Address line 1 cannot be empty";
        } else if (addOne.trim().length == 0) {
            newErrors.addOne = "Address line 1 cannot be empty";
        } else if (addOne.length > 200) {
            newErrors.addOne = "Address line 1 cannot exceed 200 characters"
        }

        if (addTwo) {
            if (addTwo.trim().length == 0) {
                newErrors.addTwo = "Address line 2 cannot be empty";
            } else if (addTwo.length > 200) {
                newErrors.addTwo = "Address line 2 cannot exceed 200 characters"
            }
        }


        if (!city) {
            newErrors.city = "City cannot be empty";
        } else if (city.trim().length == 0) {
            newErrors.city = "City cannot be empty";
        } else if (city.length > 50) {
            newErrors.city = "City cannot exceed 50 characters"
        }

        if (!brcCode) {
            newErrors.brcCode = "BRC code cannot be empty";
        } else if (brcCode.trim().length == 0) {
            newErrors.brcCode = "BRC code cannot be empty";
        } else if (brcCode.length > 100) {
            newErrors.brcCode = "BRC code cannot exceed 100 characters"
        }

        if (!accManager) {
            newErrors.accManager = "Account manager cannot be empty";
        } else if (accManager.trim().length == 0) {
            newErrors.accManager = "Account manager cannot be empty";
        } else if (accManager.length > 50) {
            newErrors.accManager = "Account manager cannot exceed 50 characters"
        }


        if (!accCode) {
            newErrors.accCode = "Company account code cannot be empty";
        } else if (accCode < 1) {
            newErrors.accCode = "Company account code cannot be 0";
        } else if (accCode > 999999) {
            newErrors.accCode = "Company account code cannot exceed 999999";
        }

        if (!billingCOde) {
            newErrors.billingCOde = "Billing code cannot be empty";
        } else if (billingCOde < 1) {
            newErrors.billingCOde = "Billing code cannot be 0";
        } else if (billingCOde > 999999) {
            newErrors.billingCOde = "Billing code cannot exceed 999999";
        }

        if (!accManagerEmail) {
            newErrors.accManagerEmail = "Account manager email cannot be empty";
        } else if (accManagerEmail.trim().length == 0) {
            newErrors.accManagerEmail = "Account manager email cannot be empty";
        } else if (accManagerEmail.length > 50) {
            newErrors.accManagerEmail = "Account manager email cannot exceed 50 characters"
        } else if (!emailRegex.test(accManagerEmail)) {
            newErrors.accManagerEmail = "Invalid email"
        }

        if (!contactNo) {
            newErrors.contactNo = "Contact number cannot be empty";
        } else if (!mobileRegex.test(contactNo)) {
            newErrors.contactNo = "Invalid contact number"
        }

        if (!email) {
            newErrors.email = "Contact email cannot be empty";
        } else if (email.trim().length == 0) {
            newErrors.email = "Contact email cannot be empty";
        } else if (email.length > 50) {
            newErrors.email = "Contact email cannot exceed 50 characters"
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Invalid email"
        }

        if (!vatNo) {
            newErrors.vatNo = "VAT registration number cannot be empty";
        } else if (vatNo.trim().length == 0) {
            newErrors.vatNo = "VAT registration number cannot be empty";
        } else if (vatNo.length > 100) {
            newErrors.vatNo = "VAT registration number cannot exceed 100 characters"
        }

        if (!dbConfigKey) {
            newErrors.dbConfigKey = "DB Config key cannot be empty";
        } else if (dbConfigKey < 1) {
            newErrors.dbConfigKey = "DB Config key cannot be 0";
        } else if (dbConfigKey > 999999) {
            newErrors.dbConfigKey = "DB Config key cannot exceed 999999";
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

    ///////////////////// Dialog Controls /////////////////////
    const [open, setopen] = useState(false);
    const [loading, setLoading] = useState(false);


    const closeDialog = () => {
        setopen(false);
        if (create) {
            clearInputs();
        }
        setfieldErrors(initialErrors)
        // setErrors({
        //     cid: false,
        //     name: false,
        //     addOne: false,
        //     addTwo: false,
        //     city: false,
        //     brcCode: false,
        //     accManager: false,
        //     accManagerEmail: false,
        //     accCode: false,
        //     billingCOde: false,
        //     contactNo: false,
        //     email: false,
        //     vatNo: false,
        //     dbConfigKey: false,
        // });
    };

    const openDialog = () => {
        setopen(true)
    }


    /////////////////// Common Attributes //////////////////
    const [token, settoken] = useState<any>(null);
    const [companyId, setcompanyId] = useState<any>(null);

    useEffect(() => {
        const getData = async () => {
            settoken(await getToken());
            setcompanyId(await getCompanyID());
        };
        getData();
    }, []);

    ///////////////////// Attributes /////////////////////
    const [cid, setcid] = useState<any>("");
    const [name, setname] = useState<any>("");
    const [addOne, setaddOne] = useState<any>("");
    const [addTwo, setaddTwo] = useState<any>("");
    const [city, setcity] = useState<any>("");
    const [brcCode, setbrcCode] = useState<any>("");
    const [accManager, setaccManager] = useState<any>("");
    const [accManagerEmail, setaccManagerEmail] = useState<any>("");
    const [accCode, setaccCode] = useState<any>("");
    const [billingCOde, setbillingCOde] = useState<any>("");
    const [contactNo, setcontactNo] = useState<any>("");
    const [email, setemail] = useState<any>("");
    const [vatNo, setvatNo] = useState<any>("");
    const [dbConfigKey, setdbConfigKey] = useState<any>("");



    ///////////////////// Inits /////////////////////
    useEffect(() => {
        if (company) {
            setInputs();
        }
    }, [company]);

    ///////////////////// Helper Methods /////////////////////

    const clearInputs = () => {
        setcid("");
        setname("");
        setaddOne("");
        setaddTwo("");
        setcity("");
        setbrcCode("");
        setaccManager("");
        setaccManagerEmail("");
        setaccCode("");
        setbillingCOde("");
        setcontactNo("");
        setemail("");
        setvatNo("");
        setdbConfigKey("");
    };

    const setInputs = () => {
        setcid(company.companyId || "");
        setname(company.companyName || "");
        setaddOne(company.addressL1 || "");
        setaddTwo(company.addressL2 || "");
        setcity(company.city || "");
        setbrcCode(company.brcCode || "");
        setaccManager(company.accountManager || "");
        setaccManagerEmail(company.amContactEmail || "");
        setaccCode(company.companyAccountId || "");
        setbillingCOde(company.billingCodeId || "");
        setcontactNo(company.contactNo || "");
        setemail(company.contactEmail || "");
        setvatNo(company.vatNo || "");
        setdbConfigKey(company.dbConfigKey || "");
    }

    /////////////////// ERRORS ////////////////////////////
    // const [errors, setErrors] = useState({
    //     cid: false,
    //     name: false,
    //     addOne: false,
    //     addTwo: false,
    //     city: false,
    //     brcCode: false,
    //     accManager: false,
    //     accManagerEmail: false,
    //     accCode: false,
    //     billingCOde: false,
    //     contactNo: false,
    //     email: false,
    //     vatNo: false,
    //     dbConfigKey: false,
    // });

    /////////////////// VALIDATIONS ///////////////////////

    // const validateForm = () => {
    //     console.log(addTwo.trim())
    //     const newErrors = {
    //         cid: cid <= 0,
    //         name: !name.trim() || name.length > 50,
    //         addOne: !addOne.trim() || addOne.length > 200,
    //         addTwo: addTwo.trim().length > 0 && addTwo.length > 200,
    //         city: !city.trim() || city.length > 50,
    //         brcCode: !brcCode.trim() || brcCode.length > 100,
    //         accManager: !accManager.trim() || accManager.length > 50,
    //         accManagerEmail: !accManagerEmail.trim() || !/^[a-zA-Z0-9.]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),
    //         accCode: accCode <= 0 || accCode.length > 11,
    //         billingCOde: billingCOde <= 0 || billingCOde.length > 11,
    //         contactNo: contactNo <= 0 || !/^\d{10}$/.test(contactNo),
    //         email: !email.trim() || !/^[a-zA-Z0-9.]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),
    //         vatNo: vatNo <= 0 || vatNo.length > 100,
    //         dbConfigKey: dbConfigKey <= 0 || dbConfigKey.length > 50,

    //     };

    //     setErrors(newErrors);

    //     return !Object.values(newErrors).some(error => error);
    // };





    ///////////////////// API Calls /////////////////////


    const onCreate = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true)

        let request: any = {
            companyId: cid, // Assuming cid is set from state
            companyName: name, // Assuming name is set from state
            addressL1: addOne, // Address Line 1
            addressL2: addTwo, // Address Line 2
            city: city, // City
            brcCode: brcCode, // BRC Code
            accountManager: accManager, // Account Manager
            companyAccountId: accCode, // Company Account ID
            billingCodeId: billingCOde, // Billing Code ID
            contactNo: contactNo, // Contact Number
            contactEmail: email, // Contact Email
            amContactEmail: accManagerEmail, // Account Manager Email
            vatNo: vatNo, // VAT Number
            dbConfigKey: dbConfigKey, // Database Config Key
        };

        setReload(!reload)

        let res: any = await createCompany(token, request);
        if (res?.state === 0) {
            setAlert({
                open: true,
                type: "success",
                message: "Company created successfully",
            });
            setReload(!reload)
            clearInputs();
            setLoading(false)
        } else if (res?.state === 1) {
            setAlert({
                open: true,
                type: "error",
                message: res.responseObject,
            });
            setLoading(false)
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Failed to create the Company",
            });
            setLoading(false)
        }
    };

    const onUpdate = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true)


        let request: any = {
            companyId: cid, // Assuming cid is set from state
            companyName: name, // Assuming name is set from state
            addressL1: addOne, // Address Line 1
            addressL2: addTwo, // Address Line 2
            city: city, // City
            brcCode: brcCode, // BRC Code
            accountManager: accManager, // Account Manager
            companyAccountId: accCode, // Company Account ID
            billingCodeId: billingCOde, // Billing Code ID
            contactNo: contactNo, // Contact Number
            contactEmail: email, // Contact Email
            amContactEmail: accManagerEmail, // Account Manager Email
            vatNo: vatNo, // VAT Number
            dbConfigKey: dbConfigKey, // Database Config Key
        };

        let res = await modifyCompany(token, request);
        if (res?.state === 0) {
            setAlert({
                open: true,
                type: "success",
                message: "Compnay updated successfully",
            });
            setReload(!reload)
            setLoading(false)
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Failed to update Compnay",
            });
            setLoading(false)
        }
    };

    return (
        <React.Fragment>
            {create && <PrimaryButton onClick={openDialog} label="ADD" icon={<Add />} />}
            {view && <IconButton onClick={openDialog}><Visibility /></IconButton>}
            {edit && <IconButton onClick={openDialog}><Edit /></IconButton>}

            <Dialog open={open} sx={{ backdropFilter: 'blur(3px)' }} maxWidth='md' >
                <GlobalAlert alert={alert} setAlert={setAlert} />

                <Stack justifyContent={'space-between'} flexDirection={'row'}>
                    <DialogTitle variant="h5">
                        {view && 'View Company'}
                        {create && 'Create Company'}
                        {edit && 'Update Company'}
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
                        <Grid2 container spacing={2}>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={cid || ""}
                                    onChange={(e) => setcid(Number(e.target.value))}
                                    disabled={view || edit}
                                    label="Company ID*"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.cid)}
                                    // type='number'
                                    helperText={fieldErrors.cid}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={name || ""}
                                    onChange={(e) => setname(e.target.value)}
                                    disabled={view}
                                    label="Company Name*"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.name)}
                                    helperText={fieldErrors.name}
                                   
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={addOne || ""}
                                    onChange={(e) => setaddOne(e.target.value)}
                                    disabled={view}
                                    label="Address Line 1*"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.addOne)}
                                    helperText={fieldErrors.addOne}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={addTwo || ""}
                                    onChange={(e) => setaddTwo(e.target.value)}
                                    disabled={view}
                                    label="Address Line 2"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.addTwo)}
                                    helperText={fieldErrors.addTwo}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={city || ""}
                                    onChange={(e) => setcity(e.target.value)}
                                    disabled={view}
                                    label="City*"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.city)}
                                    helperText={fieldErrors.city}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={brcCode || ""}
                                    onChange={(e) => setbrcCode(e.target.value)}
                                    disabled={view}
                                    label="BRC Code*"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.brcCode)}
                                    helperText={fieldErrors.brcCode}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={accManager || ""}
                                    onChange={(e) => setaccManager(e.target.value)}
                                    disabled={view}
                                    label="Account Manager*"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.accManager)}
                                    helperText={fieldErrors.accManager}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={accManagerEmail || ""}
                                    onChange={(e) => setaccManagerEmail(e.target.value)}
                                    disabled={view}
                                    label="Account Manager Email*"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.accManagerEmail)}
                                    helperText={fieldErrors.accManagerEmail}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={accCode || ""}
                                    onChange={(e) => setaccCode(Number(e.target.value))}
                                    disabled={view}
                                    label="Company Account Code*"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.accCode)}
                                    helperText={fieldErrors.accCode}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={billingCOde || ""}
                                    onChange={(e) => setbillingCOde(Number(e.target.value))}
                                    disabled={view || edit}
                                    label="Billing Code*"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.billingCOde)}
                                    helperText={fieldErrors.billingCOde}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={contactNo || ""}
                                    onChange={(e) => setcontactNo(e.target.value)}
                                    disabled={view}
                                    label="Contact Number*"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.contactNo)}
                                    helperText={fieldErrors.contactNo}
                                    placeholder='0711234567'
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={email || ""}
                                    onChange={(e) => setemail(e.target.value)}
                                    disabled={view}
                                    label="Contact Email*"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.email)}
                                    helperText={fieldErrors.email}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={vatNo || ""}
                                    onChange={(e) => setvatNo(e.target.value)}
                                    disabled={view}
                                    label="VAT Registration No*"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.vatNo)}
                                    helperText={fieldErrors.vatNo}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={dbConfigKey || ""}
                                    onChange={(e) => setdbConfigKey(Number(e.target.value))}
                                    disabled={view || edit}
                                    label="DB Config Key*"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.dbConfigKey)}
                                    helperText={fieldErrors.dbConfigKey}
                                />
                            </Grid2>


                        </Grid2>
                        <Stack alignItems={"end"} mt={2} flexDirection={'row-reverse'} gap={1}>
                            {loading ? <CircularProgress color="secondary" /> :
                                <React.Fragment>
                                    {create && <PrimaryButton onClick={onCreate} label='Create' />}
                                    {edit && <PrimaryButton onClick={onUpdate} label='Save' />}
                                </React.Fragment>
                            }
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>
        </React.Fragment >
    );
}
