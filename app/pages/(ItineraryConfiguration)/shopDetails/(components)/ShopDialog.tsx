import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';
import { Add, Close, Edit, Visibility } from '@mui/icons-material';
import { Alert, Autocomplete, Box, Button, CircularProgress, CSSObject, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, Grid, Grid2, IconButton, InputLabel, MenuItem, Paper, Select, Snackbar, Stack, TextField, Typography } from '@mui/material';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import { addDistributorStore, addUser, createSalesPoint, findAllAreaHirachy, findRootsByHierarchy, findSupervisorListByRole, getUmBranches, googleAPI, retriewAllROutPlans, retriewUserRoles, updateDisPoint, updateSalesPoint, updateUser } from '@/app/(services)/SFARestClient';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { useDropzone } from "react-dropzone";
import { getCompanyID, getToken } from '@/app/util/UserDataHandler';
import { alphanumericCharactersRegex, emailRegex, mobileRegex, nicRegex } from '@/app/regex';

interface Props {
    ///// Common ////////
    view?: boolean;
    edit?: boolean;
    create?: boolean;
    setReload: Dispatch<SetStateAction<boolean>>;
    reload: boolean;
    //////// Spceific////////////
    globalRootPlan: any[]
    shop?: any;
}


interface FieldErrors {
    routeId: string;
    brcCode: string;
    ownerName: string;
    nic: string;
    contactNOne: string;
    contactNTwo: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    selectedDistrict: string;
    shopName: string;
    creditLimit: string;
    lat: string;
    lng: string;
}


export default function ShopDialog({ shop, view, edit, create, setReload, reload, globalRootPlan }: Props) {

    /////////////////// New Validation /////////////////////
    const initialErrors: FieldErrors = {
        routeId: "",
        brcCode: "",
        ownerName: "",
        nic: "",
        contactNOne: "",
        contactNTwo: "",
        email: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        selectedDistrict: "",
        shopName: "",
        creditLimit: "",
        lat: "",
        lng: "",
    }

    const [fieldErrors, setfieldErrors] = useState<FieldErrors>({ ...initialErrors });

    const validateForm = () => {
        const newErrors: Partial<FieldErrors> = {};
        setfieldErrors(initialErrors); 

        if (!routeId) {
            newErrors.routeId = "Route name cannot be empty";
        }

        if (!brcCode) {
            newErrors.brcCode = "BRC code cannot be empty";
        } else if (brcCode.trim().length == 0) {
            newErrors.brcCode = "BRC code cannot be empty";
        } else if (brcCode.length > 50) {
            newErrors.brcCode = "BRC code cannot exceed 50 characters"
        } else if (!alphanumericCharactersRegex.test(brcCode)) {
            newErrors.brcCode = "BRC code can only contain alphabetic characters"
        }

        if (!ownerName) {
            newErrors.ownerName = "Owner name cannot be empty";
        } else if (ownerName.trim().length == 0) {
            newErrors.ownerName = "Owner name cannot be empty";
        } else if (ownerName.length > 50) {
            newErrors.ownerName = "Owner name cannot exceed 50 characters"
        }

        if (!nic) {
            newErrors.nic = "NIC cannot be empty";
        } else if (nic.trim().length == 0) {
            newErrors.nic = "NIC cannot be empty";
        } else if (!nicRegex.test(nic)) {
            newErrors.nic = "Invalid nic"
        }

        if (!contactNOne) {
            newErrors.contactNOne = "Contact one cannot be empty";
        } else if (contactNOne.trim().length == 0) {
            newErrors.contactNOne = "Contact one cannot be empty";
        } else if (!mobileRegex.test(contactNOne)) {
            newErrors.contactNOne = "Invalid contact one"
        }

        if (contactNTwo.trim().length != 0 && !mobileRegex.test(contactNTwo)) {
            newErrors.contactNTwo = "Invalid contact two"
        }

        if (email.trim().length != 0 && !emailRegex.test(email)) {
            newErrors.email = "Invalid email"
        }

        if (creditLimit && creditLimit > 999999) {
            newErrors.creditLimit = "Quantity cannot exceed 999999"
        }

        if (!addressLine1) {
            newErrors.addressLine1 = "Address line 1 cannot be empty";
        } else if (addressLine1.trim().length == 0) {
            newErrors.addressLine1 = "Address line 1 cannot be empty";
        } else if (addressLine1.length > 200) {
            newErrors.addressLine1 = "Address line 1 cannot exceed 200 characters"
        }

        if (!addressLine2) {
            newErrors.addressLine2 = "Address line 2 cannot be empty";
        } else if (addressLine2.trim().length == 0) {
            newErrors.addressLine2 = "Address line 2 cannot be empty";
        } else if (addressLine2.length > 200) {
            newErrors.addressLine2 = "Address line 2 cannot exceed 200 characters"
        }

        if (!city) {
            newErrors.city = "City cannot be empty";
        } else if (city.trim().length == 0) {
            newErrors.city = "City cannot be empty";
        } else if (city.length > 50) {
            newErrors.city = "City cannot exceed 50 characters"
        }

        if (!selectedDistrict) {
            newErrors.selectedDistrict = "District cannot be empty";
        }

        if (!shopName) {
            newErrors.shopName = "Shop name cannot be empty";
        } else if (shopName.trim().length == 0) {
            newErrors.shopName = "Shop name cannot be empty";
        } else if (shopName.length > 100) {
            newErrors.shopName = "Shop name cannot exceed 100 characters"
        }

        

        setfieldErrors((prevErrors) => ({
            ...prevErrors,
            ...newErrors,
        }));

        return Object.keys(newErrors).length === 0;
    }

    const IMG_URL = process.env.NEXT_PUBLIC_REST_API_BASE_URL + "/public/asset/natural";

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
        if (create) {
            clearInputs();
        }
        setfieldErrors(initialErrors)
    }

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

    // useLayoutEffect(() => {
    //     if (typeof window !== "undefined") {
    //         settoken(sessionStorage.getItem("token"))
    //         setcompanyId(sessionStorage.getItem("token")?.split(":")[4])
    //     }
    // }, []);

    ///////////////////// Attributes /////////////////////
    const districtList = [
        { districtId: 0, districtName: "All-Island", latitude: 7.671682, longitude: 80.650010, zoomLevel: 8 },
        { districtId: 1, districtName: "Colombo", latitude: 6.9271, longitude: 79.8612, zoomLevel: 9 },
        { districtId: 2, districtName: "Gampaha", latitude: 7.0912, longitude: 79.9944, zoomLevel: 9 },
        { districtId: 3, districtName: "Kalutara", latitude: 6.5836, longitude: 79.9597, zoomLevel: 9 },
        { districtId: 4, districtName: "Kandy", latitude: 7.2906, longitude: 80.6337, zoomLevel: 9 },
        { districtId: 5, districtName: "Matale", latitude: 7.4702, longitude: 80.6234, zoomLevel: 9 },
        { districtId: 6, districtName: "Nuwara Eliya", latitude: 6.9497, longitude: 80.7891, zoomLevel: 9 },
        { districtId: 7, districtName: "Galle", latitude: 6.0535, longitude: 80.2210, zoomLevel: 9 },
        { districtId: 8, districtName: "Matara", latitude: 5.9549, longitude: 80.5550, zoomLevel: 9 },
        { districtId: 9, districtName: "Hambantota", latitude: 6.1248, longitude: 81.1185, zoomLevel: 9 },
        { districtId: 10, districtName: "Jaffna", latitude: 9.6615, longitude: 80.0255, zoomLevel: 9 },
        { districtId: 11, districtName: "Kilinochchi", latitude: 9.3803, longitude: 80.3847, zoomLevel: 9 },
        { districtId: 12, districtName: "Mannar", latitude: 8.9810, longitude: 79.9046, zoomLevel: 9 },
        { districtId: 13, districtName: "Vavuniya", latitude: 8.7545, longitude: 80.4982, zoomLevel: 9 },
        { districtId: 14, districtName: "Mullaitivu", latitude: 9.2677, longitude: 80.8141, zoomLevel: 9 },
        { districtId: 15, districtName: "Batticaloa", latitude: 7.7102, longitude: 81.6924, zoomLevel: 9 },
        { districtId: 16, districtName: "Ampara", latitude: 7.3026, longitude: 81.6741, zoomLevel: 9 },
        { districtId: 17, districtName: "Trincomalee", latitude: 8.5874, longitude: 81.2152, zoomLevel: 9 },
        { districtId: 18, districtName: "Kurunegala", latitude: 7.4869, longitude: 80.3647, zoomLevel: 9 },
        { districtId: 19, districtName: "Puttalam", latitude: 8.0362, longitude: 79.8289, zoomLevel: 9 },
        { districtId: 20, districtName: "Anuradhapura", latitude: 8.3114, longitude: 80.4037, zoomLevel: 9 },
        { districtId: 21, districtName: "Polonnaruwa", latitude: 7.9403, longitude: 81.0187, zoomLevel: 9 },
        { districtId: 22, districtName: "Badulla", latitude: 6.9893, longitude: 81.0550, zoomLevel: 9 },
        { districtId: 23, districtName: "Monaragala", latitude: 6.8724, longitude: 81.3509, zoomLevel: 9 },
        { districtId: 24, districtName: "Ratnapura", latitude: 6.6828, longitude: 80.3990, zoomLevel: 9 },
        { districtId: 25, districtName: "Kegalle", latitude: 7.2513, longitude: 80.3465, zoomLevel: 9 }
    ];


    const [id, setid] = useState<any>("");
    const [routeId, setRouteId] = useState<number | null>(null);
    const [brcCode, setBrcCode] = useState<string>("");
    const [ownerName, setOwnerName] = useState<string>("");
    const [nic, setNic] = useState<string>("");
    const [contactNOne, setContactNOne] = useState<string>("");
    const [contactNTwo, setContactNTwo] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [addressLine1, setAddressLine1] = useState<string>("");
    const [addressLine2, setAddressLine2] = useState<string>("");
    const [city, setCity] = useState<string>("");
    const [selectedDistrict, setSelectedDistrict] = useState<string>("");
    const [shopName, setShopName] = useState<string>("");
    const [creditLimit, setCreditLimit] = useState<number | null>(null);
    const [lat, setLat] = useState(6.9271);  // Default latitude
    const [lng, setLng] = useState(79.8612); // Default longitude
    const [image, setimage] = useState<any>("");



    ///////////////////// Inits /////////////////////
    useEffect(() => {
        if (shop) {
            setInputs();
        }
    }, [shop]);

    ///////////////////// Helper Methods /////////////////////

    const clearInputs = () => {
        setid("");
        setRouteId(null);
        setBrcCode("");
        setOwnerName("");
        setNic("");
        setContactNOne("");
        setContactNTwo("");
        setEmail("");
        setAddressLine1("");
        setAddressLine2("");
        setCity("");
        setSelectedDistrict("");
        setShopName("");
        setCreditLimit(null);
        setLat(6.9271);
        setLng(79.8612);
        setFiles([]);
    };

    const setInputs = () => {
        if (shop) {
            setid(shop.id || "");
            setRouteId(shop.routeId || null);
            setBrcCode(shop.brcCode || "");
            setOwnerName(shop.ownerName || "");
            setNic(shop.nic || "");
            setContactNOne(shop.contactNumber1 || "");
            setContactNTwo(shop.contactNumber2 || "");
            setEmail(shop.email || "");
            setAddressLine1(shop.addressLine1 || "");
            setAddressLine2(shop.addressLine2 || "");
            setCity(shop.city || "");
            setSelectedDistrict(shop.district || "");
            setShopName(shop.shopName || "");
            setCreditLimit(shop.creditLimit || null);
            setLat(Number(shop.latitude) || 6.9271);
            setLng(Number(shop.longitude) || 79.8612);
            setzoom(16)
            setimage(shop.image)
            setmarker(<Marker position={{ lat: Number(shop.latitude), lng: Number(shop.longitude) }} />)
        }
    }




    ///////////////////// API Calls /////////////////////


    const onCreate = async () => {

        if (!validateForm()) {
            return;
        }

        setLoading(true)

        let disSalesPoint: any = {
            companyId: companyId,
            city: city,
            addressLine1: addressLine1,
            addressLine2: addressLine2,
            shopName: shopName,
            district: selectedDistrict,
            brcCode: brcCode,
            email: email,
            image: files.length > 0 ? Array.from(await convertFileToByteArray(files[0])) : null, // Convert Uint8Array to normal array
            latitude: lat.toString(),
            longitude: lng.toString(),
            nic: nic,
            ownerName: ownerName,
            routeId: routeId,
            contactNumber1: contactNOne,
            contactNumber2: contactNTwo,
            creditLimit: creditLimit
        }

        let request: any = {
            disSalesPoint: disSalesPoint,
            tokenString: token
        }
        setReload(!reload)

        let res: any = await createSalesPoint(token, request);
        if (res.success === true) {
            setAlert({
                open: true,
                type: "success",
                message: "Shop created successfully",
            });
            setReload(!reload)
            clearInputs();
            setLoading(false)
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Failed to create the Shop",
            });
            setLoading(false)
        }
    };

    const onUpdate = async () => {

        if (!validateForm()) {
            return;
        }

        setLoading(true)

        let disSalesPoint: any = {
            id: shop.id,
            companyId: companyId,
            city: city,
            addressLine1: addressLine1,
            addressLine2: addressLine2,
            shopName: shopName,
            district: selectedDistrict,
            brcCode: brcCode,
            email: email,
            image: files.length > 0 ? Array.from(await convertFileToByteArray(files[0])) : (shop.image != null ? Array.from(base64ToByteArray(shop.image)) : null), // Convert Uint8Array to normal array
            latitude: lat.toString(),
            longitude: lng.toString(),
            nic: nic,
            ownerName: ownerName,
            routeId: routeId,
            contactNumber1: contactNOne,
            contactNumber2: contactNTwo,
            creditLimit: creditLimit
        }

        let request: any = {
            disSalesPoint: disSalesPoint,
            tokenString: token
        }
        setReload(!reload)

        let res: any = await updateSalesPoint(token, request);
        if (res?.success === true) {
            setAlert({
                open: true,
                type: "success",
                message: "Shop updated successfully",
            });
            setReload(!reload)
            clearInputs();
            setLoading(false)
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Failed to update the Shop",
            });
            setLoading(false)
        }
    };

    useEffect(() => {

        if (selectedDistrict != "" && (create)) {
            setmap(false)
            let dis = districtList.find(i => i.districtName == selectedDistrict);
            if (dis) {
                setLat(dis.latitude)
                setLng(dis.longitude)
                setzoom(dis.zoomLevel)
                setTimeout(() => {
                    setmap(true);
                }, 1000);
            }
        }
    }, [selectedDistrict]);
    const searchPlaces = async (value: string) => {
        let data = await googleAPI(value);
        if (data && data.results) {
            setPlaces(data.results)
        } else {
            setPlaces([])
        }
    }

    const [places, setPlaces] = useState([]);
    const [marker, setmarker] = useState<React.ReactNode>(null);
    const [map, setmap] = useState<boolean>(true);
    const [zoom, setzoom] = useState<number>(8);


    ////////////// Image upload /////////////////////
    const [files, setFiles] = React.useState<any[]>([]);
    const [images, setimages] = React.useState<any>([]);
    const maxFiles = 1;

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'image/*': []
        },
        maxSize: 1000000,
        maxFiles: maxFiles,
        onDrop: (acceptedFiles, event: any) => {
            setFiles(
                acceptedFiles.map(file => Object.assign(file, {
                    preview: URL.createObjectURL(file)
                })
                )
            );
            setimages(acceptedFiles)
        },
        onDropRejected(fileRejections, event: any) {
            if (fileRejections.length > maxFiles) {
                setAlert({
                    open: true,
                    type: "error",
                    message: `Maximum of ${maxFiles} file allowed.`,
                });
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: "File size must not exceed 1MB.",
                });
                setFiles([])
            }
        },
    });

    function clearFiles() {
        setFiles([]);

    }


    async function convertFileToByteArray(file: File): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onloadend = () => {
                if (reader.result instanceof ArrayBuffer) {
                    resolve(new Uint8Array(reader.result)); // Convert to Uint8Array
                } else {
                    reject(new Error("Failed to convert file to byte array."));
                }
            };

            reader.onerror = (error) => reject(error);

            reader.readAsArrayBuffer(file);
        });
    }

    function base64ToByteArray(base64String: string): Uint8Array {
        const binaryString = atob(base64String); // Decodes Base64 to binary string
        const byteArray = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
            byteArray[i] = binaryString.charCodeAt(i);
        }

        return byteArray;
    }

    const thumbs =
        <Stack display={'flex'} alignItems={'end'}>
            <IconButton onClick={clearFiles}>
                <Close />
            </IconButton>
            {
                files.map(file => (

                    <Box sx={thumb} key={file.name} component={Paper}>
                        <Box sx={thumbInner}>
                            <img
                                src={URL.createObjectURL(file)}
                                style={img}
                                // Revoke data uri after image is loaded
                                onLoad={() => { URL.revokeObjectURL(file.preview) }}
                            />
                        </Box>
                    </Box>
                ))
            }
        </Stack>

    ///////////////////// ERROR ////////////////////
    // const [errors, setErrors] = useState({
    //     routeId: false,
    //     brcCode: false,
    //     ownerName: false,
    //     nic: false,
    //     contactNOne: false,
    //     addressLine1: false,
    //     city: false,
    //     selectedDistrict: false,
    //     shopName: false,
    //     lat: false,
    //     lng: false,
    // });

    // const validateForm = () => {
    //     const newErrors = {
    //         routeId: !routeId, // Check if routeId is empty
    //         brcCode: !brcCode.trim(), // Check if brcCode is empty
    //         ownerName: !ownerName.trim(), // Check if ownerName is empty
    //         nic: !nic.trim() || !/^(?:19|20)\d{10}$|^\d{9}[xXvV]$/.test(nic), // Check if nic is empty
    //         contactNOne: !contactNOne.trim(), // Check if contactNOne is empty
    //         addressLine1: !addressLine1.trim(), // Check if addressLine1 is empty
    //         city: !city.trim(), // Check if city is empty
    //         selectedDistrict: !selectedDistrict, // Check if selectedDistrict is empty
    //         shopName: !shopName.trim(), // Check if shopName is empty
    //         lat: !lat, // Check if lat is empty
    //         lng: !lng, // Check if lng is empty
    //     };

    //     setErrors(newErrors);

    //     return !Object.values(newErrors).some(error => error);
    // };

    return (
        <React.Fragment>
            {create && <PrimaryButton onClick={() => {
                openDialog();
                clearInputs();
            }} label="ADD" icon={<Add />} />}
            {view && <IconButton onClick={openDialog}><Visibility /></IconButton>}
            {edit && <IconButton onClick={openDialog}><Edit /></IconButton>}

            <Dialog open={open} sx={{ backdropFilter: 'blur(3px)' }} maxWidth='md' fullWidth>
                <GlobalAlert alert={alert} setAlert={setAlert} />

                <Stack justifyContent={'space-between'} flexDirection={'row'}>
                    <DialogTitle variant="h5">
                        {view && 'View Shop'}
                        {create && 'Create Shop'}
                        {edit && 'Update Shop'}
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
                                <FormControl fullWidth size="small" disabled={view} error={Boolean(fieldErrors.routeId)}>
                                    <InputLabel>Route Name*</InputLabel>
                                    <Select
                                        label="Route Name*"
                                        value={routeId || ""}
                                        onChange={(e) => setRouteId(e.target.value as number)}

                                    >
                                        <MenuItem value={""}>Please select an option</MenuItem>
                                        {globalRootPlan?.map((root) => (
                                            <MenuItem key={root.id} value={root.id}>
                                                {root.rootName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.routeId}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={brcCode || ""}
                                    onChange={(e) => setBrcCode(e.target.value)}
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
                                    value={ownerName || ""}
                                    onChange={(e) => setOwnerName(e.target.value)}
                                    disabled={view}
                                    label="Owner Name*"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.ownerName)}
                                    helperText={fieldErrors.ownerName}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={nic || ""}
                                    onChange={(e) => setNic(e.target.value)}
                                    disabled={view}
                                    label="Owner NIC*"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.nic)}
                                    helperText={fieldErrors.nic}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={contactNOne || ""}
                                    onChange={(e) => setContactNOne(e.target.value)}
                                    disabled={view}
                                    label="Contact 1*"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.contactNOne)}
                                    helperText={fieldErrors.contactNOne}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={contactNTwo || ""}
                                    onChange={(e) => setContactNTwo(e.target.value)}
                                    disabled={view}
                                    label="Contact 2"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.contactNTwo)}
                                    helperText={fieldErrors.contactNTwo}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={email || ""}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={view}
                                    label="Email"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.email)}
                                    helperText={fieldErrors.email}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={creditLimit || ""}
                                    onChange={(e) => setCreditLimit(parseFloat(e.target.value))}
                                    disabled={view}
                                    label="Credit Limit (LKR)"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.creditLimit)}
                                    helperText={fieldErrors.creditLimit}
                                    type='number'
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={addressLine1 || ""}
                                    onChange={(e) => setAddressLine1(e.target.value)}
                                    disabled={view}
                                    label="Address Line 1*"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.addressLine1)}
                                    helperText={fieldErrors.addressLine1}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={addressLine2 || ""}
                                    onChange={(e) => setAddressLine2(e.target.value)}
                                    disabled={view}
                                    label="Address Line 2*"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.addressLine2)}
                                    helperText={fieldErrors.addressLine2}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={city || ""}
                                    onChange={(e) => setCity(e.target.value)}
                                    disabled={view}
                                    label="City*"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.city)}
                                    helperText={fieldErrors.city}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth size="small" disabled={view} error={Boolean(fieldErrors.selectedDistrict)}>
                                    <InputLabel>District*</InputLabel>
                                    <Select
                                        label="District*"
                                        value={selectedDistrict || ""}
                                        onChange={(e) => setSelectedDistrict(e.target.value as string)}

                                    >
                                        {districtList?.map((dis) => (
                                            <MenuItem key={dis.districtId} value={dis.districtName}>
                                                {dis.districtName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>
                                        {fieldErrors.selectedDistrict}
                                    </FormHelperText>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    value={shopName || ""}
                                    onChange={(e) => setShopName(e.target.value)}
                                    disabled={view}
                                    label="Shop Name*"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.shopName)}
                                    helperText={fieldErrors.shopName}
                                />
                            </Grid2>
                        </Grid2>

                        <Divider sx={{ mt: 2, mb: 2 }} />

                        <Grid2 container spacing={2} sx={{ mb: 2 }}>
                            <Grid2 size={{ xs: 12, sm: 3 }}>
                                <TextField
                                    value={lat || ""}
                                    onChange={(e) => setLat(Number(e.target.value))}
                                    disabled={view}
                                    label="Latitude *"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.lat)}
                                    helperText={fieldErrors.lat}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 3 }}>
                                <TextField
                                    value={lng || ""}
                                    onChange={(e) => setLng(Number(e.target.value))}
                                    disabled={view}
                                    label="Longitude *"
                                    fullWidth
                                    size="small"
                                    error={Boolean(fieldErrors.lng)}
                                    helperText={fieldErrors.lng}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <Autocomplete
                                    onChange={(event, selectedValue) => {
                                        const findLocationLatLong = async () => {
                                            setmap(false)
                                            let res = await googleAPI(selectedValue);
                                            if (res && res.results) {
                                                let data = res.results[0]?.geometry?.location;
                                                setLat(data.lat)
                                                setLng(data.lng)
                                                setmarker(
                                                    <Marker position={{ lat: Number(data.lat), lng: Number(data.lng) }} />
                                                )
                                                setmap(true)
                                                setzoom(16)

                                            } else {
                                                setPlaces([])
                                                setLat(6.9271);
                                                setLng(79.8612);
                                                setmap(true)
                                                setzoom(8)
                                            }
                                        }

                                        if (selectedValue != '') {
                                            findLocationLatLong();
                                        }

                                    }}
                                    fullWidth
                                    size='small'
                                    disablePortal
                                    options={places?.map((option: any) => option.formatted_address)}
                                    renderInput={(params) => <TextField {...params} label="Search Location"
                                        onChange={(e) => searchPlaces(e.target.value)} />}
                                />
                            </Grid2>
                        </Grid2>
                        {map ?
                            <APIProvider apiKey={'AIzaSyAKG6VTLfpdRId7P25GJE1B3wyn418U4hs'}>
                                <Map
                                    onClick={(e) => {
                                        setmarker(null)
                                        if (e.detail.latLng?.lat && e.detail.latLng?.lng) {
                                            setLat(e.detail.latLng.lat)
                                            setLng(e.detail.latLng.lng)
                                            setmarker(<Marker position={{ lat: Number(e.detail.latLng?.lat), lng: Number(e.detail.latLng?.lng) }} />)
                                        }

                                    }}
                                    style={{ width: '100%', height: '50vh' }}
                                    defaultCenter={{ lat: lat, lng: lng }}
                                    defaultZoom={zoom}
                                    gestureHandling={'greedy'}
                                    disableDefaultUI={true}
                                >
                                    {marker != null && marker}
                                </Map>
                            </APIProvider> :
                            <Box sx={{ width: '100%', height: '50vh' }}></Box>
                        }
                        {/* Image upload */}
                        <Stack>
                            <InputLabel sx={{ fontWeight: 'bold', mt: 2 }} >Shop Image</InputLabel>

                            {!view && files.length == 0 &&
                                <Box {...getRootProps({ className: 'dropzone' })} sx={{ mt: 2, padding: '20px', border: '1px dashed grey', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                    <img width={'20%'} src={'/default.png'} />
                                    <input {...getInputProps()} />
                                    <Typography>Drag & drop image here, or click to select the image</Typography>
                                    <Typography sx={{ fontStyle: 'italic', color: '#4a4a4a', fontSize: '10pt' }}>
                                        (Only one image can drop here)
                                    </Typography>
                                    <Typography sx={{ fontStyle: 'italic', color: '#4a4a4a', fontSize: '10pt' }}>
                                        (Image file must not exceed 1MB in size)
                                    </Typography>
                                </Box>
                            }
                            {(view || edit) && files.length == 0 &&
                                <Box sx={thumbsContainer}>
                                    <Stack display={'flex'} alignItems={'end'}>
                                        <Box sx={thumb} component={Paper}>
                                            <Box sx={thumbInner}>
                                                {image != null ?
                                                    <img src={`data:image/jpeg;base64,${image}`} alt="Image" /> :
                                                    <img width={'100%'} src={'/default.png'} />
                                                }
                                            </Box>
                                        </Box>
                                    </Stack>
                                </Box>
                            }
                            {files.length > 0 &&
                                <Box sx={thumbsContainer}>
                                    {thumbs}
                                </Box>
                            }
                        </Stack>


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


const thumbsContainer: CSSObject = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: '16px',
    justifyContent: 'center',
    overflowY: 'scroll',
    maxHeight: '250px'
};

const thumb: CSSObject = {
    display: 'inline-flex',
    borderRadius: '2px',
    border: '1px solid #eaeaea',
    marginBottom: '8px',
    marginRight: '8px',
    width: '100%',
    height: '150px',
    padding: '4px',
    boxSizing: 'border-box'
};

const thumbInner = {
    display: 'flex',
    minWidth: 0,
    overflow: 'hidden'
};

const img = {
    display: 'block',
    width: 'auto',
    height: '100%'
};
