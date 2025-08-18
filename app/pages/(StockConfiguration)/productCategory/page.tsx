"use client"
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import CustomDatePicker from '@/app/(components)/(DatePicker)/CustomDatePicker';
import PageContent from '@/app/(components)/(Page)/PageContent'
import { addProductCategory, retrieveAllProductCategories, retriewAllAvailableItinerary, saveAnualLeavePlan, saveItineraryTemplate } from '@/app/(services)/SFARestClient';
import { FormControl, Grid2, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from '@mui/material'
import dayjs from 'dayjs';
import React, { useEffect, useLayoutEffect, useState } from 'react'
import CategoryDialog from './(component)/CategoryDialog';
import { getRole, getToken } from '@/app/util/UserDataHandler';
import { UserRole } from '@/app/(enums)/UserRole';
import { redirect } from 'next/navigation';

export default function ProductCategory() {
    //////////////////// Alert ////////////////////////
    const [alert, setAlert] = useState<AlertProp>({
        open: false,
        type: "success",
        message: "",
    });

    const [reload, setReload] = useState<boolean>(false);
    const [token, settoken] = useState<any>(null);

    //// init /////
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
    const [categoryName, setcategoryName] = useState<any>("");
    const [description, setdescription] = useState<any>("");
    const [globalProductCatList, setglobalProductCatList] = useState<any[]>([]);

    //////////////////////// Init //////////////////////////
    useEffect(() => {

        const init = async () => {
            const res = await retrieveAllProductCategories(token, { tokenString: token });
            if (res.success === true) {
                setglobalProductCatList(res.productCatList)
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
        setcategoryName("");
        setdescription("");
    }

    /////////////////Methods///////////////
    const saveProductCategory = async () => {
        const req = {
            productCategory: {
                categoryName: categoryName,
                description: description
            },
            tokenString: token
        }

        const res = await addProductCategory(token, req);
        if (res.success === true) {
            clearInputs();
            setAlert({
                open: true,
                type: "success",
                message: "Product Category has been successfully created.",
            });
            setReload(!reload);
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Creation of product category has been failed.",
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


    return (
        <PageContent title="Product Category"
            action={ (role == UserRole.COOP_ADMIN || role == UserRole.COORDINATOR) &&
                <CategoryDialog reload={reload} setReload={setReload} create={true} />
            }
        >
            <GlobalAlert alert={alert} setAlert={setAlert} />
            {/* <Grid2 container spacing={2} width={'100%'} >
                <Grid2 size={{ xs: 12, md: 2 }} sx={{ display: 'flex', alignItems: 'center', maxWidth: '200px' }}>
                    <InputLabel sx={{ fontWeight: 'bold', }} >Category Name *</InputLabel>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                    <TextField
                        value={categoryName || ""}
                        onChange={(e) => setcategoryName(e.target.value)}
                        fullWidth
                        variant='outlined'
                        label="Category Name *"
                        size='small'
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
                        label="Category Description *"
                        size='small'
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                    <Stack width={'100%'}>
                        <PrimaryButton label="Add" onClick={saveProductCategory} />
                    </Stack>
                </Grid2>
               
            </Grid2> */}

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell ><strong>Category Name</strong></TableCell>
                            <TableCell><strong>Category Description</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {globalProductCatList
                            ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                            .map((row: any, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.categoryName}</TableCell>
                                    <TableCell>{row.description}</TableCell>
                                </TableRow>
                            ))}

                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={globalProductCatList?.length || 0}
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
