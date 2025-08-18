"use client"
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import CustomDatePicker from '@/app/(components)/(DatePicker)/CustomDatePicker';
import PageContent from '@/app/(components)/(Page)/PageContent'
import { addProductCategory, addProductRequest, productCode, retrieveAllProductCategories, } from '@/app/(services)/SFARestClient';
import { FormControl, Grid2, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from '@mui/material'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import ProductDialog from './(components)/ProductDialog';
import { getRole, getToken } from '@/app/util/UserDataHandler';
import { UserRole } from '@/app/(enums)/UserRole';

export default function Product() {
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

    //////////////////////////////////////////////////

    ///////////////////// Attributes ///////////////////////
    const [globalProductCatList, setglobalProductCatList] = useState<any[]>([]);
    const [code, setcode] = useState<any>("");
    const [name, setname] = useState<any>("");
    const [qty, setqty] = useState<number>(0);
    const [category, setcategory] = useState<any>("");
    const [productList, setproductList] = useState<any[]>([]);

    //////////////////////// Init //////////////////////////
    useEffect(() => {

        const init = async () => {
            const res = await productCode(token, { tokenString: token });
            if (res.success === true) {
                setproductList(res.disProductList)
            } else {
                setproductList([])
            }

            const productRes = await retrieveAllProductCategories(token, { tokenString: token });
            if (productRes.success === true) {
                clearInputs();
                setglobalProductCatList(productRes.productCatList)
            } else {
                setglobalProductCatList([])
            }
        };

        if (token) {
            init();
        }
    }, [token, reload]);



    //////////////////Helpers///////////////
    const clearInputs = () => {
        setcode("");
        setname("");
        setcategory("");
        setqty(0);
    }

    /////////////////Methods///////////////
    // const addProduct = async () => {
    //     const req = {
    //         disProduct: {
    //             approvalId: 0,
    //             discountType: "",
    //             freeIssueFlag: false,
    //             maxQuantity: qty,
    //             productCode: code,
    //             productName: name,
    //             productGroup: 0,
    //             specialApproval: false,
    //             active: true,
    //             serialActive: false,
    //             approveStatus: null,
    //             categoryId: category
    //         },
    //         tokenString: token
    //     }

    //     const res = await addProductRequest(token, req);
    //     if (res?.success === true) {
    //         clearInputs();
    //         setAlert({
    //             open: true,
    //             type: "success",
    //             message: "New product has been successfully added.",
    //         });
    //         setReload(!reload);
    //     } else if(res?.success == false){
    //         setAlert({
    //             open: true,
    //             type: "error",
    //             message: res.message,
    //         });
    //     }else {
    //         setAlert({
    //             open: true,
    //             type: "error",
    //             message: "Creation of product has been failed.",
    //         });
    //     }

    // }



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
        <PageContent title="Product Details" action={
            (role == UserRole.COOP_ADMIN || role == UserRole.COORDINATOR) &&
            <ProductDialog
                reload={reload}
                setReload={setReload}
                globalProductCatList={globalProductCatList}
                create={true}


            />}>
            <GlobalAlert alert={alert} setAlert={setAlert} />
            {/* <Grid2 container spacing={2} width={'100%'} >
                <Grid2 size={{ xs: 12, md: 2 }} sx={{ display: 'flex', alignItems: 'center', maxWidth: '200px' }}>
                    <InputLabel sx={{ fontWeight: 'bold', }} >Product Code *</InputLabel>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                    <TextField
                        value={code || ""}
                        onChange={(e) => setcode(e.target.value)}
                        fullWidth
                        variant='outlined'
                        label="Product Code *"
                        size='small'
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }} sx={{ display: 'flex', alignItems: 'center', maxWidth: '200px' }}>
                    <InputLabel sx={{ fontWeight: 'bold', }} >Product Name *</InputLabel>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                    <TextField
                        value={name || ""}
                        onChange={(e) => setname(e.target.value)}
                        fullWidth
                        variant='outlined'
                        label="Product Name *"
                        size='small'
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }} sx={{ display: 'flex', alignItems: 'center', maxWidth: '200px' }}>
                    <InputLabel sx={{ fontWeight: 'bold', }} >Max Quantity</InputLabel>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                    <TextField
                        value={qty || 0}
                        onChange={(e) => setqty( Number(e.target.value))}
                        fullWidth
                        variant='outlined'
                        label="Max Quantity"
                        size='small'
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }} sx={{ display: 'flex', alignItems: 'center', maxWidth: '200px' }}>
                    <InputLabel sx={{ fontWeight: 'bold', }} >Product Category *</InputLabel>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Product Category *</InputLabel>
                        <Select
                            label="Product Category *"
                            value={category || ""}
                            onChange={(e) => setcategory(e.target.value as number)}

                        >
                            <MenuItem value={""}>Please select an option</MenuItem>
                            {globalProductCatList?.map((item) => (
                                <MenuItem key={item.categoryId} value={item.categoryId}>
                                    {item.categoryName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid2>

                <Grid2 size={{ xs: 12, md: 2 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                    <Stack width={'100%'}>
                        <PrimaryButton label="Submit" onClick={addProduct} size='medium' />
                    </Stack>
                </Grid2>

            </Grid2> */}

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell ><strong>Product Code</strong></TableCell>
                            <TableCell ><strong>Product Name</strong></TableCell>
                            <TableCell><strong>Max Quantity</strong></TableCell>
                            <TableCell ><strong>Created At</strong></TableCell>
                            <TableCell ><strong>Created By</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {productList
                            ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                            .map((row: any, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.productCode}</TableCell>
                                    <TableCell>{row.productName}</TableCell>
                                    <TableCell>{row.maxQuantity}</TableCell>
                                    <TableCell>{row.createdAt}</TableCell>
                                    <TableCell>{row.createdBy}</TableCell>
                                </TableRow>
                            ))}

                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={productList?.length || 0}
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
