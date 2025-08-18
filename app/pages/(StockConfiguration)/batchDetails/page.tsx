"use client"
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import CustomDatePicker from '@/app/(components)/(DatePicker)/CustomDatePicker';
import PageContent from '@/app/(components)/(Page)/PageContent'
import { addProductCategory, addProductRequest, getBatchByProductCode, productCode, retrieveAllProductCategories, } from '@/app/(services)/SFARestClient';
import { FormControl, Grid2, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from '@mui/material'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import BatchDialog from './(components)/BatchDialog';
import { getCompanyID, getRole, getToken } from '@/app/util/UserDataHandler';
import { UserRole } from '@/app/(enums)/UserRole';
import { redirect } from 'next/navigation';

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

    useEffect(() => {
        if (role != null) {
            if (!(role == UserRole.SUPER_ADMIN ||
                role == UserRole.COOP_ADMIN ||
                role == UserRole.MANAGER ||
                role == UserRole.COORDINATOR ||
                role == UserRole.SALES_REP)) {
                redirect('/pages/dashboard')
            }
        }
    }, [role]);

    //////////////////////////////////////////////////

    ///////////////////// Attributes ///////////////////////
    const [globalProductCatList, setglobalProductCatList] = useState<any[]>([]);
    const [code, setcode] = useState<any>("");
    const [name, setname] = useState<any>("");
    const [qty, setqty] = useState<number>(0);
    const [category, setcategory] = useState<any>("");
    const [productList, setproductList] = useState<any[]>([]);
    const [selectedProduct, setselectedProduct] = useState<any>("");
    const [batchList, setbatchList] = useState<any[]>([]);

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
    useEffect(() => {
        if (selectedProduct != "") {
            getBatchDetailsByProductCode();
        }
    }, [selectedProduct, reload]);
    const getBatchDetailsByProductCode = async () => {
        const req = {
            tokenString: token,
            productCode: selectedProduct,
            batchStatus: null
        }
        const res = await getBatchByProductCode(token, req);

        if (res?.success === true) {
            setbatchList(res.batchList)
        } else {
            setAlert({
                message: `Somthing is not right`,
                type: 'error',
                open: true
            })
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


    return (
        <PageContent title="Batch Details" action={(role == UserRole.COOP_ADMIN || role == UserRole.COORDINATOR) && <BatchDialog
            reload={reload}
            setReload={setReload}
            globalProductCatList={globalProductCatList}
            create={true}
            globalProductList={productList}


        />}>
            <GlobalAlert alert={alert} setAlert={setAlert} />
            <Grid2 container width={'100%'}>
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Product *</InputLabel>
                        <Select
                            label="Product *"
                            value={selectedProduct || ""}
                            onChange={(e) => setselectedProduct(e.target.value)}

                        >
                            <MenuItem value={""}>Please select an option</MenuItem>
                            {productList?.map((item) => (
                                <MenuItem key={item.productId} value={item.productCode}>
                                    {item.productName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid2>
            </Grid2>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell ><strong>Batch Id</strong></TableCell>
                            <TableCell ><strong>Batch Code</strong></TableCell>
                            <TableCell><strong>SKU Price</strong></TableCell>
                            <TableCell ><strong>SKU Units</strong></TableCell>
                            <TableCell><strong>Total Quantity</strong></TableCell>
                            <TableCell ><strong>Whole Sale Price</strong></TableCell>
                            <TableCell ><strong>Retail Price</strong></TableCell>
                            <TableCell ><strong>SKU Per Box</strong></TableCell>
                            <TableCell ><strong>Manufactured Date</strong></TableCell>
                            <TableCell ><strong>Expiry Date</strong></TableCell>
                            <TableCell ><strong>Added Date</strong></TableCell>
                            {(role == UserRole.COOP_ADMIN || role == UserRole.MANAGER) &&
                                <TableCell ><strong>Action</strong></TableCell>
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {batchList
                            ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                            .map((row: any, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.batchId}</TableCell>
                                    <TableCell>{row.batchCode}</TableCell>
                                    <TableCell>{row.skuPrice}</TableCell>
                                    <TableCell>{row.skuUnits}</TableCell>
                                    <TableCell>{row.totalQuantity}</TableCell>
                                    <TableCell>{row.wholeSalePrice}</TableCell>
                                    <TableCell>{row.retailPrice}</TableCell>
                                    <TableCell>{row.skuPerBox}</TableCell>
                                    <TableCell>{row.manufactureDate}</TableCell>
                                    <TableCell>{row.expiaryDate}</TableCell>
                                    <TableCell>{row.addedDate}</TableCell>
                                    {(role == UserRole.COOP_ADMIN || role == UserRole.MANAGER) &&
                                        <TableCell align="center">
                                            <Stack direction={'row'} justifyContent={'center'} spacing={2}>
                                                <BatchDialog globalProductCatList={globalProductCatList}
                                                    globalProductList={productList}
                                                    reload={reload}
                                                    setReload={setReload}
                                                    edit={true}
                                                    selectedBatch={row}
                                                />
                                            </Stack>
                                        </TableCell>
                                    }
                                </TableRow>
                            ))}

                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={batchList?.length || 0}
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
