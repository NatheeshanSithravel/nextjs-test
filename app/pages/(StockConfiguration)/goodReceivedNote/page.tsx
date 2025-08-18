"use client"
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import CustomDatePicker from '@/app/(components)/(DatePicker)/CustomDatePicker';
import PageContent from '@/app/(components)/(Page)/PageContent'
import { UserRole } from '@/app/(enums)/UserRole';
import { getGINByUser, productCode, retrieveAllProductCategories, retriewAllDistributors, updateGRNbyDistributor, } from '@/app/(services)/SFARestClient';
import { getRole, getToken } from '@/app/util/UserDataHandler';
import { FormControl, Grid2, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography } from '@mui/material'
import { redirect } from 'next/navigation';
import React, { useEffect, useLayoutEffect, useState } from 'react'


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
            if (!(role == UserRole.DEALER)) {
                redirect('/pages/dashboard')
            }
        }
    }, [role]);
    //////////////////////////////////////////////////

    ///////////////////// Attributes ///////////////////////
    const [selectedInvoice, setselectedInvoice] = useState<any>("");
    const [grnDtoList, setgrnDtoList] = useState<any[]>([]);
    const [globalGrnDetailsList, setglobalGrnDetailsList] = useState<any[]>([]);
    const [distributorName, setDistributorName] = useState<any>("");
    const [issueDate, setIssueDate] = useState<any>("");
    const [companyNote, setCompanyNote] = useState<any>("");
    const [invoiceNumber, setInvoiceNumber] = useState<any>("");
    const [selectedDisGrnDto, setselectedDisGrnDto] = useState<any>({});

    //////////////////////// Init //////////////////////////
    useEffect(() => {

        const init = async () => {
            const res = await getGINByUser(token, { tokenString: token, status: "Pending" });
            if (res.success === true) {
                setgrnDtoList(res.grnDtoList)
            } else {
                setgrnDtoList([])
            }

        };

        if (token) {
            init();
        }
    }, [token, reload]);



    //////////////////Helpers///////////////
    const clearInputs = () => {
        setglobalGrnDetailsList([]);
        setDistributorName("");
        setIssueDate("");
        setCompanyNote("");
        setInvoiceNumber("");
        setselectedDisGrnDto({})
        setselectedInvoice("");
    }

    /////////////////Methods///////////////
    const grnLoader = () => {
        if (selectedInvoice) {
            const tempDisGrnDto = grnDtoList.find((tempGRN) => selectedInvoice === tempGRN.disGrn.invoiceNumber);

            if (selectedDisGrnDto) {
                setDistributorName(tempDisGrnDto.disGrn.dealerName);
                setIssueDate(tempDisGrnDto.disGrn.addedAt);
                setCompanyNote(tempDisGrnDto.disGrn.companyNote);
                setInvoiceNumber(tempDisGrnDto.disGrn.invoiceNumber);
                let tempGrnDetailsList: any[] = tempDisGrnDto.grnDetailsList;

                for (let i of tempGrnDetailsList) {
                    i.receivedQuantity = ""
                }

                setglobalGrnDetailsList(tempGrnDetailsList);
                setselectedDisGrnDto(tempDisGrnDto)
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: "No details found for the selected invoice number",
                });
            }
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "No details found for the selected invoice number",
            });
        }
    }

    useEffect(() => {
        if (selectedInvoice != "") {
            grnLoader();
        } else {
            clearInputs()
        }
    }, [selectedInvoice]);

    const saveGRN = async () => {
        for (let i of globalGrnDetailsList) {
            if (i.receivedQuantity == "") {
                setAlert({
                    message: 'Received quantity cannot be empty.',
                    type: 'error',
                    open: true
                })
                return;
            } else if (i.receivedQuantity > i.issuesQuantity) {
                setAlert({
                    message: 'Issued Quantity cannot be exceeded.',
                    type: 'error',
                    open: true
                })
                return;
            }
        }

        selectedDisGrnDto.disGrn.approval = "Approved";

        let req = {
            tokenString: token,
            disGrn: selectedDisGrnDto.disGrn,
            disGrnDetailsList: globalGrnDetailsList
        }

        const res = await updateGRNbyDistributor(token, req);

        if (res?.success === true) {
            clearInputs();
            setAlert({
                message: "Good received note has been sent successfully.",
                type: 'success',
                open: true
            })
            setReload(!reload)
        } else {
            setAlert({
                message: "Good received not has been failed to send.",
                type: 'success',
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
        <PageContent title="Good Received Note">
            <GlobalAlert alert={alert} setAlert={setAlert} />
            <Grid2 container width={'100%'} spacing={2} sx={{ alignItems: 'center' }} mb={2}>
                <Grid2 size={{ xs: 12, md: 2 }} sx={{ maxWidth: '100px' }}>
                    <InputLabel sx={{ fontWeight: 'bold' }}>Pending GIN</InputLabel>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Pending GIN</InputLabel>
                        <Select
                            label="Pending GIN"
                            value={selectedInvoice || ""}
                            onChange={(e) => { setselectedInvoice(e.target.value); }}

                        >
                            <MenuItem value={""}>Please select an option</MenuItem>
                            {grnDtoList?.map((item) => (
                                <MenuItem key={item.disGrn.invoiceNumber} value={item.disGrn.invoiceNumber}>
                                    {item.disGrn.invoiceNumber}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid2>
            </Grid2>
            <Grid2 container width={'100%'} spacing={2} sx={{ alignItems: 'center' }} mb={2}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Assigned Dealer *"
                        value={distributorName}
                        variant='outlined'
                        size='small'
                        fullWidth
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Issued Date *"
                        value={issueDate}
                        variant='outlined'
                        size='small'
                        fullWidth
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                    <TextField
                        label="Invoice Number *"
                        value={invoiceNumber}
                        variant='outlined'
                        size='small'
                        fullWidth
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Notes"
                        value={companyNote}
                        variant='outlined'
                        size='small'
                        fullWidth
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                    <Stack width={'100%'}>
                        <PrimaryButton disabled={selectedInvoice == ""} label='Submit' onClick={saveGRN} />
                    </Stack>
                </Grid2>
            </Grid2>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell ><strong>Product Code</strong></TableCell>
                            <TableCell ><strong>Batch Code</strong></TableCell>
                            <TableCell><strong>Serial Range</strong></TableCell>
                            <TableCell ><strong>Issued Quantity</strong></TableCell>
                            <TableCell ><strong>Received Quantity</strong></TableCell>
                            <TableCell ><strong>Special Notes</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {globalGrnDetailsList
                            ?.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                            .map((row: any, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.productCode}</TableCell>
                                    <TableCell>{row.batchCode}</TableCell>
                                    <TableCell>{row.serialStartNumber}</TableCell>
                                    <TableCell>{row.issuesQuantity}</TableCell>
                                    <TableCell>
                                        <TextField
                                            value={row.receivedQuantity}
                                            fullWidth
                                            size='small'
                                            onChange={(e) => {
                                                let temp: any[] = globalGrnDetailsList;
                                                let index = globalGrnDetailsList.indexOf(row);
                                                if (!isNaN(Number(e.target.value))) {
                                                    row.receivedQuantity = Number(e.target.value);
                                                }

                                                temp[index] = row;
                                                setglobalGrnDetailsList([...temp])
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>{row.dealerNote}</TableCell>
                                </TableRow>
                            ))}

                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={globalGrnDetailsList?.length || 0}
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
