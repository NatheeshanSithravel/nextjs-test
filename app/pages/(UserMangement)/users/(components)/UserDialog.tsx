import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { Add, Close, Edit, Visibility } from '@mui/icons-material';
import { Alert, Button, CircularProgress, CSSObject, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, Grid, Grid2, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack, TextField } from '@mui/material';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import { addUser, findAllAreaHirachy, findClientCompany, findRootsByHierarchy, findSupervisorListByRole, getUmBranches, retriewAllROutPlans, retriewUserRoles, updateUser } from '@/app/(services)/SFARestClient';
import { getCompanyID, getRole, getToken } from '@/app/util/UserDataHandler';
import { emailRegex, mobileRegex } from '@/app/regex';
import { UserRole } from '@/app/(enums)/UserRole';

interface Props {
    user?: any;
    view?: boolean;
    edit?: boolean;
    create?: boolean;
    setReload: Dispatch<SetStateAction<boolean>>;
    reload: boolean;
    roleMasterList: any[];
    umBranchesList: any[];
    globalHierarchyList: any[];
}


interface FieldErrors {
    nic: string;
    name: string;
    mobile: string;
    email: string;
    addressOne: string;
    addressTwo: string;
    city: string;
    cname: string;
    role: string;
    supervisor: string;
    branch: string;
    regionHierarchy: string;
    region: string;
    username: string;
}

export default function UserDialog({
    user,
    view,
    edit,
    create,
    setReload,
    reload,
    roleMasterList,
    umBranchesList,
    globalHierarchyList,
}: Props) {

    /////////////////// New Validation /////////////////////
    const initialErrors: FieldErrors = {
        nic: "",
        name: "",
        mobile: "",
        email: "",
        addressOne: "",
        addressTwo: "",
        city: "",
        cname: "",
        role: "",
        supervisor: "",
        branch: "",
        regionHierarchy: "",
        region: "",
        username: ""
    };


    const [fieldErrors, setfieldErrors] = useState<FieldErrors>({ ...initialErrors });

    const validateForm = () => {
        const newErrors: Partial<FieldErrors> = {};
        setfieldErrors(initialErrors);

        if (!nic) {
            newErrors.nic = "Nic cannot be empty";
        } else if (nic.trim().length == 0) {
            newErrors.nic = "Nic cannot be empty";
        } else if (!/^(?:19|20)\d{10}$|^\d{9}[xXvV]$/.test(nic)) {
            newErrors.nic = "Invalid NIC format";
        }

        if (!name) {
            newErrors.name = "Full name cannot be empty";
        } else if (name.trim().length == 0) {
            newErrors.name = "Full name cannot be empty";
        } else if (name.length > 200) {
            newErrors.name = "Full name cannot exceed 200 characters"
        }

        if (!mobile) {
            newErrors.mobile = "Mobile number cannot be empty";
        } else if (!mobileRegex.test(mobile)) {
            newErrors.mobile = "Invalid mobile number format"
        }

        if (!email) {
            newErrors.email = "Email cannot be empty";
        } else if (email.trim().length == 0) {
            newErrors.email = "Email cannot be empty";
        } else if (email.length > 50) {
            newErrors.email = "Email cannot exceed 50 characters"
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Invalid email"
        }


        if (!addressOne) {
            newErrors.addressOne = "Address line 1 cannot be empty";
        } else if (addressOne.trim().length == 0) {
            newErrors.addressOne = "Address line 1 cannot be empty";
        } else if (addressOne.length > 200) {
            newErrors.addressOne = "Address line 1 cannot exceed 200 characters"
        }

        if (addressTwo) {
            if (addressTwo.trim().length == 0) {
                newErrors.addressTwo = "Address line 2 cannot be empty";
            } else if (addressTwo.length > 200) {
                newErrors.addressTwo = "Address line 2 cannot exceed 200 characters"
            }
        }

        if (!city) {
            newErrors.city = "City cannot be empty";
        } else if (city.trim().length == 0) {
            newErrors.city = "City cannot be empty";
        } else if (city.length > 150) {
            newErrors.city = "City cannot exceed 150 characters"
        }

        if (!cname) {
            newErrors.cname = "Calling name cannot be empty";
        } else if (cname.trim().length == 0) {
            newErrors.cname = "Calling name cannot be empty";
        } else if (cname.length > 50) {
            newErrors.cname = "Calling name cannot exceed 50 characters"
        }
        if (!role) {
            newErrors.role = "Role cannot be empty";
        }

        if (!supervisor) {
            newErrors.supervisor = "Supervisor cannot be empty";
        }

        if (!branch) {
            newErrors.branch = "Branch cannot be empty";
        }

        if (!regionHierarchy) {
            newErrors.regionHierarchy = "Region hierarchy cannot be empty";
        }
        if (!region) {
            newErrors.region = "Region cannot be empty";
        }

        if (!username) {
            newErrors.username = "Username cannot be empty";
        } else if (username.trim().length == 0) {
            newErrors.username = "Username cannot be empty";
        } else if (username.length > 15) {
            newErrors.username = "Username cannot exceed 15 characters"
        } else if (!/^\S+$/.test(username)) {
            newErrors.username = "Username cannot have spaces"
        }
        
        setfieldErrors((prevErrors) => ({
            ...prevErrors,
            ...newErrors,
        }));

        return Object.keys(newErrors).length === 0;
    }

    ///////////////////// Dialog Controls /////////////////////
    const [open, setopen] = useState(false);
    const [loading, setLoading] = useState(false);


    const closeDialog = () => {
        setopen(false)
        if (create) {
            clearInputs()
        }
        // setErrors({
        //     nic: false,
        //     name: false,
        //     mobile: false,
        //     email: false,
        //     addressOne: false,
        //     addressTwo: false,
        //     city: false,
        //     cname: false,
        //     role: false,
        //     supervisor: false,
        //     branch: false,
        //     regionHierarchy: false,
        //     region: false,
        //     username: false,
        // });
        setfieldErrors(initialErrors);
    }

    const openDialog = () => {
        setopen(true)
    }


    /////////////////// Common Attributes //////////////////
    const [token, settoken] = useState<any>(null);
    const [companyId, setcompanyId] = useState<any>(null);
    const [userRole, setuserRole] = useState<any>(null);

    useEffect(() => {
        const getData = async () => {
            settoken(await getToken());
            setcompanyId(await getCompanyID());
            setuserRole(await getRole());
        };
        getData();
    }, []);

    useEffect(() => {
        if(userRole && userRole == UserRole.SUPER_ADMIN && create){
            const findClient = async ()=>{
                if (token != null) {
                    let res:any = await findClientCompany(token, {});
                    if (res?.state === 0) {
                        setcompanyId(res?.responseObject == 0 ? "0":res?.responseObject)
                    } else {
                        setcompanyId("")
                    }
                }
            }

            findClient();
        }
    }, [userRole, token]);

    ///////////////////// Attributes /////////////////////


    const [nic, setnic] = useState<any>('');
    const [name, setname] = useState<any>('');
    const [mobile, setmobile] = useState<any>('');
    const [email, setemail] = useState<any>('');
    const [addressOne, setaddressOne] = useState<any>('');
    const [addressTwo, setaddressTwo] = useState<any>('');
    const [city, setcity] = useState<any>('');
    const [cname, setcname] = useState<any>('');
    const [role, setrole] = useState<any>('');
    const [supervisor, setsupervisor] = useState<any>('');
    const [branch, setbranch] = useState<any>('');
    const [regionHierarchy, setregionHierarchy] = useState<any>('');
    const [region, setregion] = useState<any>('');
    const [username, setusername] = useState<any>('');
    const [password, setpassword] = useState<any>('');

    // const [globalRootPlan, setglobalRootPlan] = useState<any[]>([]);
    // const [roleMasterList, setroleMasterList] = useState<any[]>([]);
    // const [umBranchesList, setumBranchesList] = useState<any[]>([]);
    // const [globalHierarchyList, setglobalHierarchyList] = useState<any[]>([]);
    // const [supervisorList, setsupervisorList] = useState<any[]>([]);

    const [globalRootPlan, setglobalRootPlan] = useState<any[]>([]);
    const [supervisorList, setsupervisorList] = useState<any[]>([]);




    ///////////////////// Inits /////////////////////
    useEffect(() => {
        if (user) {
            setInputs();
        }
    }, [user]);


    // useEffect(() => {
    //     const init = async () => {
    //         if (token) {
    //             let roleResponse = await retriewUserRoles(token);
    //             setroleMasterList(roleResponse != null ? roleResponse : []);

    //             let branchRes: any = await getUmBranches(token, companyId);
    //             setumBranchesList(branchRes?.success == true ? branchRes.branchesList : []);

    //             let hierarchyRes: any = await findAllAreaHirachy({ tokenString: token })
    //             setglobalHierarchyList(hierarchyRes?.success == true ? hierarchyRes.areaHierarchyList : [])
    //         }
    //     }

    //     init();

    // }, [token]);


    ///////////////////// Helper Methods /////////////////////

    const clearInputs = () => {
        setnic('');
        setname('');
        setmobile('');
        setemail('');
        setaddressOne('');
        setaddressTwo('');
        setcity('');
        setcname('');
        setrole('');
        setsupervisor('');
        setbranch('');
        setregionHierarchy('');
        setregion('');
        setusername('');
    };

    const setInputs = () => {
        setname(user?.fullName)
        setmobile(user?.mobileNo)
        setemail(user?.email)
        setcname(user?.callingName)
        setbranch(user?.branchCode)
        setrole(user?.userRole)
        setsupervisor(user?.lineManager)
    }




    ///////////////////// API Calls /////////////////////


    const onCreate = async () => {

        if (!validateForm()) return;

        setLoading(true)

        let levelId = roleMasterList.filter(s => s.roleID == role)[0]?.levelId;

        let request: any = {
            nic: nic,
            addLineOne: addressOne,
            addLineTwo: addressTwo,
            addCity: city,
            companyID: companyId,
            loginID: null,
            password: null,
            fName: name,
            callingName: cname,
            mobileNo: mobile,
            email: email,
            branchCode: branch,
            levelID: levelId,
            lineManager: supervisor,
            addedBy: sessionStorage.getItem("username"),
            userStatus: null,
            expiaryDate: null,
            userRole: role,
            userName: username,
            removedBy: null,
            region: region
        }
        setReload(!reload)

        let res: any = await addUser(token, request);
        if (res?.state === 0) {
            setAlert({
                open: true,
                type: "success",
                message: "User created successfully",
            });
            setReload(!reload)
            clearInputs();
            setLoading(false)
        } else {
            setAlert({
                open: true,
                type: "error",
                message: `Failed to create user : ${res.msg}`,
            });
            setLoading(false)
        }
    };

    const onUpdate = async () => {

        if (!validateForm()) return;

        setLoading(true)

        let levelId = roleMasterList.filter(s => s.roleID == role)[0]?.levelId;

        let request: any = {
            id: user?.id,
            nic: nic,
            addLineOne: addressOne,
            addLineTwo: addressTwo,
            addCity: city,
            companyID: companyId,
            loginID: null,
            fName: name,
            callingName: cname,
            mobileNo: mobile,
            email: email,
            branchCode: branch,
            levelID: levelId,
            lineManager: supervisor,
            addedBy: sessionStorage.getItem("username"),
            userStatus: user?.status,
            expiaryDate: null,
            userRole: role,
            userName: user?.userName,
            password: user?.password,
            removedBy: null,
            region: region
        }
        let res = await updateUser(token, request);
        if (res?.state === 0) {
            setAlert({
                open: true,
                type: "success",
                message: "User updated successfully",
            });
            setReload(!reload)
            setLoading(false)
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Failed to update user",
            });
            setLoading(false)
        }
    };


    const findSupervisorList = async () => {
        if (token && role) {
            let res = await findSupervisorListByRole(token, { userRole: role })
            if (res) {
                setsupervisorList(res)
            } else {
                setsupervisorList([])
            }
        }
    }

    useEffect(() => {
        findSupervisorList()
    }, [role, token]);


    const routFilterByHierarchy = async () => {
        if (token && regionHierarchy != '') {
            let res = await findRootsByHierarchy(token, { hierarchyId: regionHierarchy })
            console.log(res)
            if (res) {
                let rootPlans: any[] = res?.success == true ? res.rootPlans : [];
                rootPlans = rootPlans.filter(i => i.companyID == companyId);
                setglobalRootPlan(rootPlans)
            } else {
                setglobalRootPlan([])
            }
        }
    }

    useEffect(() => {
        routFilterByHierarchy()
    }, [regionHierarchy]);

    //////////////////// Alert ////////////////////////
    const [alert, setAlert] = useState<AlertProp>({
        open: false,
        type: "success",
        message: "",
    });

    ////////////// ERRORS /////////////////
    // const [errors, setErrors] = useState({
    //     nic: false,
    //     name: false,
    //     mobile: false,
    //     email: false,
    //     addressOne: false,
    //     addressTwo: false,
    //     city: false,
    //     cname: false,
    //     role: false,
    //     supervisor: false,
    //     branch: false,
    //     regionHierarchy: false,
    //     region: false,
    //     username: false,
    // });

    // Validation function
    // const validateForm = () => {
    //     const newErrors = {
    //         nic: create == true && !nic.trim() || !/^(?:19|20)\d{10}$|^\d{9}[xXvV]$/.test(nic), // Check if nic is empty
    //         name: !name.trim() || name.length > 200,
    //         mobile: mobile <= 0 || !/^\d{9,10}$/.test(mobile),
    //         email: !email.trim() || !/^[a-zA-Z0-9.]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),
    //         addressOne: create == true && (!addressOne.trim() || addressOne.length < 1 || addressOne.length > 200),
    //         addressTwo: create == true && (addressTwo.length > 200 || (addressTwo.length > 0 && !addressTwo.trim())),
    //         city: create == true && (!city.trim() || city.length < 1 || city.length > 150),
    //         cname: !cname.trim() || cname.length < 1 || cname.length > 50,
    //         role: !role,
    //         supervisor: !supervisor,
    //         branch: !branch,
    //         regionHierarchy: create == true && !regionHierarchy,
    //         region: create == true && !region,
    //         username: create == true && (!username.trim() || username.length < 1 || username.length > 15),
    //     };
    //     setErrors(newErrors);
    //     return !Object.values(newErrors).some(error => error);
    // };


    return (
        <React.Fragment>
            {create && <PrimaryButton onClick={openDialog} label="ADD" icon={<Add />} />}
            {view && <IconButton onClick={openDialog}><Visibility /></IconButton>}
            {edit && <IconButton onClick={openDialog}><Edit /></IconButton>}

            <Dialog open={open} sx={{ backdropFilter: 'blur(3px)' }} maxWidth='md' >
                <GlobalAlert alert={alert} setAlert={setAlert} />

                <Stack justifyContent={'space-between'} flexDirection={'row'}>
                    <DialogTitle variant="h5">
                        {view && 'View User'}
                        {create && 'Create User'}
                        {edit && 'Update User'}
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
                                    value={companyId || ""}
                                    // onChange={(e) => setcompanyId(e.target.value)}
                                    disabled={true}
                                    label="Company ID *"
                                    fullWidth
                                    size="small"
                                />
                            </Grid2>
                            {create &&
                                <Grid2 size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        value={nic || ""}
                                        onChange={(e) => setnic(e.target.value)}
                                        disabled={view}
                                        label="NIC *"
                                        fullWidth
                                        size="small"
                                        error={Boolean(fieldErrors.nic)}
                                        helperText={fieldErrors.nic}
                                    />
                                </Grid2>
                            }
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={name || ""}
                                    onChange={(e) => setname(e.target.value)}
                                    disabled={view}
                                    label="Full Name *"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.name)}
                                    helperText={fieldErrors.name}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={mobile || ""}
                                    disabled={view}
                                    label="Mobile Number *"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.mobile)}
                                    helperText={fieldErrors.mobile}
                                    onChange={(e) => setmobile(e.target.value)}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={email || ""}
                                    onChange={(e) => setemail(e.target.value)}
                                    disabled={view}
                                    label="Email *"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.email)}
                                    helperText={fieldErrors.email}
                                />
                            </Grid2>
                            {create &&
                                <Grid2 size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        value={addressOne || ""}
                                        onChange={(e) => setaddressOne(e.target.value)}
                                        disabled={view}
                                        label="Address Line 1 *"
                                        fullWidth
                                        size="small"
                                        error={Boolean(fieldErrors.addressOne)}
                                        helperText={fieldErrors.addressOne}
                                    />
                                </Grid2>
                            }
                            {create &&
                                <Grid2 size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        value={addressTwo || ""}
                                        onChange={(e) => setaddressTwo(e.target.value)}
                                        disabled={view}
                                        label="Address Line 2"
                                        fullWidth
                                        size="small"
                                        error={Boolean(fieldErrors.addressTwo)}
                                        helperText={fieldErrors.addressTwo}
                                    />
                                </Grid2>
                            }
                            {create &&
                                <Grid2 size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        value={city || ""}
                                        onChange={(e) => setcity(e.target.value)}
                                        disabled={view}
                                        label="City *"
                                        fullWidth
                                        size="small"
                                        error={Boolean(fieldErrors.city)}
                                        helperText={fieldErrors.city}
                                    />
                                </Grid2>
                            }
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={cname || ""}
                                    onChange={(e) => setcname(e.target.value)}
                                    disabled={view}
                                    label="Calling Name *"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.cname)}
                                    helperText={fieldErrors.cname}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth size="small" disabled={view} error={Boolean(fieldErrors.role)}>
                                    <InputLabel>User Role *</InputLabel>
                                    <Select
                                        label="User Role*"
                                        value={role || ""}
                                        variant="outlined"
                                        onChange={(e) => setrole(e.target.value)}
                                    >
                                        {roleMasterList?.map(
                                            role => <MenuItem key={role.roleID} value={role.roleID}>{role.roleDescription}</MenuItem>
                                        )}

                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.role}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth size="small" disabled={view} error={Boolean(fieldErrors.supervisor)}>
                                    <InputLabel>Immediate Supervisor *</InputLabel>
                                    <Select
                                        label="Immediate Supervisor *"
                                        value={supervisor || ""}
                                        variant="outlined"
                                        onChange={(e) => setsupervisor(e.target.value)}
                                    >
                                        {supervisorList?.map(
                                            i => <MenuItem key={i.id} value={i.userName}>{i.fullName}</MenuItem>
                                        )}

                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.supervisor}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth size="small" disabled={view} error={Boolean(fieldErrors.branch)}>
                                    <InputLabel>Branch Name*</InputLabel>
                                    <Select
                                        label="Branch Name*"
                                        value={branch || ""}
                                        variant="outlined"
                                        onChange={(e) => setbranch(e.target.value)}
                                    >
                                        {umBranchesList?.map(
                                            i => <MenuItem key={i.id} value={i.branchCode}>{i.branchName}</MenuItem>
                                        )}

                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.branch}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                            {create &&
                                <>
                                    <Grid2 size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth size="small" error={Boolean(fieldErrors.regionHierarchy)} >
                                            <InputLabel>Region Hierarchy *</InputLabel>
                                            <Select
                                                label="Region Hierarchy *"
                                                value={regionHierarchy || ""}
                                                variant="outlined"
                                                onChange={(e) => setregionHierarchy(e.target.value)}
                                            >
                                                {globalHierarchyList?.map(
                                                    i => <MenuItem key={i.id} value={i.id}>{i.categoryName}</MenuItem>
                                                )}

                                            </Select>
                                            <FormHelperText>
                                                {fieldErrors.regionHierarchy}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth size="small" error={Boolean(fieldErrors.region)} >
                                            <InputLabel>User Region*</InputLabel>
                                            <Select
                                                label="User Region*"
                                                value={region || ""}
                                                variant="outlined"
                                                onChange={(e) => setregion(e.target.value)}
                                            >
                                                {globalRootPlan?.map(
                                                    i => <MenuItem key={i.id} value={i.id}>{i.rootName}</MenuItem>
                                                )}

                                            </Select>
                                            <FormHelperText>
                                                {fieldErrors.region}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            value={username || ""}
                                            onChange={(e) => setusername(e.target.value)}
                                            disabled={view}
                                            label="User Name *"
                                            fullWidth
                                            size="small"
                                            error={Boolean(fieldErrors.username)}
                                            helperText={fieldErrors.username}
                                        />
                                    </Grid2>
                                </>
                            }
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

const inputTextStyle: CSSObject = {
    '& .MuiInputBase-root': {
        borderRadius: '30px',
        paddingLeft: '5px'
    },

    '& .MuiFormLabel-root': {
        paddingLeft: '5px'
    },

    '& fieldset': {
        paddingLeft: '10px'
    }

}