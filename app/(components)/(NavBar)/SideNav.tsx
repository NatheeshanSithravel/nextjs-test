"use client"
import { UserRole } from '@/app/(enums)/UserRole';
import { getRole } from '@/app/util/UserDataHandler';
import { AccountCircle, Add, Apartment, AutoAwesome, AutoAwesomeMosaic, AutoAwesomeMotion, Category, Check, CheckCircle, CheckCircleOutline, Dashboard, Description, Discount, Drafts, Edit, EditNote, EventAvailable, ExpandLess, ExpandMore, Explore, Help, Inbox, InsertDriveFile, Inventory, ListAlt, LocalGroceryStore, Mail, Map, MonetizationOn, Note, People, Percent, PersonAdd, Receipt, Send, ShoppingBag, ShowChart, Signpost, Star, StarBorder, Store } from '@mui/icons-material';
import { Collapse, Divider, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Paper, Stack, Typography } from '@mui/material'
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

interface Props {
    visibleNav?: boolean
}

export default function SideNav({ visibleNav }: Props) {

    const [selectedCollapse, setselectedCollapse] = useState<number | null>(null);

    const handleClick = (id: number) => {
        if (selectedCollapse == id) {
            setselectedCollapse(null)
        } else {
            setselectedCollapse(id)
        }

    };


    //// init /////
    const [role, setrole] = useState<any>(null);

    useEffect(() => {
        const getData = async () => {
            setrole(await getRole());
        };
        getData();
    }, []);



    return (
        <Stack width={visibleNav ? '325px' : '0'} component={Paper} elevation={2} sx={{ zIndex: 2, overflowY: 'scroll', transition: 'width 0.3s ease-in-out', overflowX: 'hidden' }}>
            <Typography m={1} style={{ color: 'rgb(167, 167, 167)', letterSpacing: 1 }}>MENU</Typography>
            <Divider />
            <List
                sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                component="nav"
                aria-labelledby="nested-list-subheader"
            // subheader={
            //     <ListSubheader component="div" id="nested-list-subheader">
            //         Nested List Items
            //     </ListSubheader>
            // }
            >
                <ListItemButton>
                    <ListItemIcon>
                        <Dashboard />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItemButton>

                {(role == UserRole.SUPER_ADMIN || role == UserRole.COOP_ADMIN) &&
                    <React.Fragment>
                        <ListItemButton onClick={() => handleClick(1)}>
                            <ListItemIcon>
                                <Apartment />
                            </ListItemIcon>
                            <ListItemText primary="Company Configuration" />
                            {selectedCollapse == 1 ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        <Collapse in={selectedCollapse == 1} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {role == UserRole.SUPER_ADMIN &&
                                    <Link href={'/pages/company'}>
                                        <ListItemButton sx={{ pl: 4 }}>
                                            <ListItemIcon>
                                                <EditNote />
                                            </ListItemIcon>
                                            <ListItemText primary="Company" />
                                        </ListItemButton>
                                    </Link>
                                }
                               <Link href={'/pages/branch'}>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemIcon>
                                            <Add />
                                        </ListItemIcon>
                                        <ListItemText primary="Branch" />
                                    </ListItemButton>
                                </Link>
                            </List>
                        </Collapse>
                    </React.Fragment>
                }
                {(role == UserRole.SUPER_ADMIN || role == UserRole.COOP_ADMIN) &&
                    <React.Fragment>
                        <ListItemButton onClick={() => handleClick(2)}>
                            <ListItemIcon>
                                <AccountCircle />
                            </ListItemIcon>
                            <ListItemText primary="User Configuration" />
                            {selectedCollapse == 1 ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        <Collapse in={selectedCollapse == 2} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <Link href={'/pages/users'}>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemIcon>
                                            <People />
                                        </ListItemIcon>
                                        <ListItemText primary="Manage Users" />
                                    </ListItemButton>
                                </Link>
                                {role == UserRole.COOP_ADMIN &&
                                    <Link href={'/pages/dealerStores'}>
                                        <ListItemButton sx={{ pl: 4 }}>
                                            <ListItemIcon>
                                                <Store />
                                            </ListItemIcon>
                                            <ListItemText primary="Dealer Stores" />
                                        </ListItemButton>
                                    </Link>
                                }
                            </List>
                        </Collapse>
                    </React.Fragment>
                }
                <React.Fragment>
                    <ListItemButton onClick={() => handleClick(3)}>
                        <ListItemIcon>
                            <Map />
                        </ListItemIcon>
                        <ListItemText primary="Itinerary Configuration" />
                        {selectedCollapse == 1 ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={selectedCollapse == 3} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {
                                (role == UserRole.SUPER_ADMIN ||
                                    role == UserRole.COOP_ADMIN ||
                                    role == UserRole.MANAGER ||
                                    role == UserRole.COORDINATOR ||
                                    role == UserRole.SALES_REP)
                                &&
                                <Link href={'/pages/locationBoundaries'}>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemIcon>
                                            <Explore />
                                        </ListItemIcon>
                                        <ListItemText primary="Location Boundaries" />
                                    </ListItemButton>
                                </Link>
                            }
                            {
                                (role == UserRole.COOP_ADMIN ||
                                    role == UserRole.MANAGER ||
                                    role == UserRole.COORDINATOR ||
                                    role == UserRole.SALES_REP)
                                &&
                                <Link href={'/pages/viewRoute'}>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemIcon>
                                            <Help />
                                        </ListItemIcon>
                                        <ListItemText primary="View Route" />
                                    </ListItemButton>
                                </Link>
                            }
                            {
                                (
                                    role == UserRole.COOP_ADMIN ||
                                    role == UserRole.MANAGER ||
                                    role == UserRole.COORDINATOR ||
                                    role == UserRole.SALES_REP ||
                                    role == UserRole.DEALER
                                )
                                &&
                                <Link href={'/pages/shopDetails'}>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemIcon>
                                            <LocalGroceryStore />
                                        </ListItemIcon>
                                        <ListItemText primary="Shop Details" />
                                    </ListItemButton>
                                </Link>
                            }
                            {
                                (
                                    role == UserRole.SUPER_ADMIN ||
                                    role == UserRole.COOP_ADMIN ||
                                    role == UserRole.SALES_REP
                                )
                                &&
                                <Link href={'/pages/createItinerary'}>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemIcon>
                                            <Signpost />
                                        </ListItemIcon>
                                        <ListItemText primary="Create Itinerary" />
                                    </ListItemButton>
                                </Link>
                            }
                            {
                                (
                                    role == UserRole.COOP_ADMIN ||
                                    role == UserRole.SALES_REP ||
                                    role == UserRole.COORDINATOR
                                )
                                &&
                                <Link href={'/pages/createItineraryTemplate'}>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemIcon>
                                            <ListAlt />
                                        </ListItemIcon>
                                        <ListItemText primary="Create Itinerary Template" />
                                    </ListItemButton>
                                </Link>
                            }
                            {
                                (
                                    role == UserRole.COOP_ADMIN ||
                                    role == UserRole.COORDINATOR ||
                                    role == UserRole.SALES_REP
                                )
                                &&
                                <Link href={'/pages/assignItineraryTemplate'}>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemIcon>
                                            <EventAvailable />
                                        </ListItemIcon>
                                        <ListItemText primary="Assign Itinerary Template" />
                                    </ListItemButton>
                                </Link>
                            }
                            {
                                (
                                    role == UserRole.MANAGER
                                )
                                &&
                                <Link href={'/pages/approveTemplate'}>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemIcon>
                                            <ListAlt />
                                        </ListItemIcon>
                                        <ListItemText primary="Approve Template" />
                                    </ListItemButton>
                                </Link>
                            }
                            {
                                (
                                    role == UserRole.COOP_ADMIN ||
                                    role == UserRole.MANAGER ||
                                    role == UserRole.COORDINATOR ||
                                    role == UserRole.SALES_REP
                                )
                                &&
                                <Link href={'/pages/addLeavePlan'}>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemIcon>
                                            <CheckCircleOutline />
                                        </ListItemIcon>
                                        <ListItemText primary="Add Leave Plan" />
                                    </ListItemButton>
                                </Link>
                            }
                        </List>
                    </Collapse>
                </React.Fragment>

                <React.Fragment>
                    <ListItemButton onClick={() => handleClick(4)}>
                        <ListItemIcon>
                            <Inventory />
                        </ListItemIcon>
                        <ListItemText primary="Stock Configuration" />
                        {selectedCollapse == 1 ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={selectedCollapse == 4} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {
                                (
                                    role == UserRole.SUPER_ADMIN ||
                                    role == UserRole.COOP_ADMIN ||
                                    role == UserRole.MANAGER ||
                                    role == UserRole.COORDINATOR ||
                                    role == UserRole.SALES_REP
                                )
                                &&
                                <Link href={'/pages/productCategory'}>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemIcon>
                                            <Category />
                                        </ListItemIcon>
                                        <ListItemText primary="Product Category" />
                                    </ListItemButton>
                                </Link>
                            }
                            {
                                (role == UserRole.SUPER_ADMIN ||
                                    role == UserRole.COOP_ADMIN ||
                                    role == UserRole.MANAGER ||
                                    role == UserRole.COORDINATOR ||
                                    role == UserRole.SALES_REP ||
                                    role == UserRole.DEALER)
                                &&
                                <Link href={'/pages/product'}>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemIcon>
                                            <LocalGroceryStore />
                                        </ListItemIcon>
                                        <ListItemText primary="Products" />
                                    </ListItemButton>
                                </Link>
                            }
                            {
                                (role == UserRole.SUPER_ADMIN ||
                                    role == UserRole.COOP_ADMIN ||
                                    role == UserRole.MANAGER ||
                                    role == UserRole.COORDINATOR ||
                                    role == UserRole.SALES_REP)
                                &&
                                <Link href={'/pages/batchDetails'}>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemIcon>
                                            <AutoAwesomeMotion />
                                        </ListItemIcon>
                                        <ListItemText primary="Batch Details" />
                                    </ListItemButton>
                                </Link>
                            }
                            {
                                (
                                    role == UserRole.COOP_ADMIN ||
                                    role == UserRole.COORDINATOR
                                )
                                &&
                                <Link href={'/pages/goodIssueNote'}>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemIcon>
                                            <Description />
                                        </ListItemIcon>
                                        <ListItemText primary="Good Issue Note" />
                                    </ListItemButton>
                                </Link>
                            }
                            {
                                (
                                    role == UserRole.DEALER
                                )
                                &&
                                <Link href={'/pages/goodReceivedNote'}>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemIcon>
                                            <Mail />
                                        </ListItemIcon>
                                        <ListItemText primary="Good Received Note" />
                                    </ListItemButton>
                                </Link>
                            }
                            {
                                (
                                    role == UserRole.COOP_ADMIN ||
                                    role == UserRole.MANAGER ||
                                    role == UserRole.COORDINATOR ||
                                    role == UserRole.SALES_REP ||
                                    role == UserRole.DEALER)
                                &&
                                <Link href={'/pages/viewStocks'}>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemIcon>
                                            <ShowChart />
                                        </ListItemIcon>
                                        <ListItemText primary="View Stocks" />
                                    </ListItemButton>
                                </Link>
                            }
                        </List>
                    </Collapse>
                </React.Fragment>

                {
                    (
                        role == UserRole.SUPER_ADMIN ||
                        role == UserRole.COOP_ADMIN ||
                        role == UserRole.MANAGER ||
                        role == UserRole.COORDINATOR ||
                        role == UserRole.SALES_REP)
                    &&
                    <React.Fragment>
                        <ListItemButton onClick={() => handleClick(5)}>
                            <ListItemIcon>
                                <Star />
                            </ListItemIcon>
                            <ListItemText primary="Sales" />
                            {selectedCollapse == 1 ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        <Collapse in={selectedCollapse == 5} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {
                                    (
                                        role == UserRole.SUPER_ADMIN ||
                                        role == UserRole.COOP_ADMIN ||
                                        role == UserRole.MANAGER ||
                                        role == UserRole.COORDINATOR ||
                                        role == UserRole.SALES_REP)
                                    &&
                                    <Link href={'/pages/salesOrder'}>
                                        <ListItemButton sx={{ pl: 4 }}>
                                            <ListItemIcon>
                                                <ShoppingBag />
                                            </ListItemIcon>
                                            <ListItemText primary="Sales Order" />
                                        </ListItemButton>
                                    </Link>
                                }
                                {
                                    (
                                        role == UserRole.COOP_ADMIN ||
                                        role == UserRole.MANAGER ||
                                        role == UserRole.COORDINATOR ||
                                        role == UserRole.SALES_REP)
                                    &&
                                    <Link href={'/pages/invoices'}>
                                        <ListItemButton sx={{ pl: 4 }}>
                                            <ListItemIcon>
                                                <Receipt />
                                            </ListItemIcon>
                                            <ListItemText primary="Invoices" />
                                        </ListItemButton>
                                    </Link>
                                }
                                {
                                    (
                                        role == UserRole.COOP_ADMIN ||
                                        role == UserRole.MANAGER ||
                                        role == UserRole.COORDINATOR ||
                                        role == UserRole.SALES_REP)
                                    &&
                                    <Link href={'/pages/returnInvoices'}>
                                        <ListItemButton sx={{ pl: 4 }}>
                                            <ListItemIcon>
                                                <InsertDriveFile />
                                            </ListItemIcon>
                                            <ListItemText primary="Return Invoices" />
                                        </ListItemButton>
                                    </Link>
                                }
                                {
                                    (
                                        role == UserRole.COOP_ADMIN ||
                                        role == UserRole.MANAGER ||
                                        role == UserRole.COORDINATOR ||
                                        role == UserRole.SALES_REP)
                                    &&
                                    <Link href={'/pages/paymentCollection'}>
                                        <ListItemButton sx={{ pl: 4 }}>
                                            <ListItemIcon>
                                                <MonetizationOn />
                                            </ListItemIcon>
                                            <ListItemText primary="Payment Collection" />
                                        </ListItemButton>
                                    </Link>
                                }
                            </List>
                        </Collapse>
                    </React.Fragment>
                }

                {
                    (
                        role == UserRole.COOP_ADMIN ||
                        role == UserRole.MANAGER ||
                        role == UserRole.COORDINATOR || 
                        role == UserRole.DEALER || 
                        role == UserRole.SALES_REP)
                    &&
                    <React.Fragment>
                        <ListItemButton onClick={() => handleClick(6)}>
                            <ListItemIcon>
                                <Percent />
                            </ListItemIcon>
                            <ListItemText primary="Discount Configuration" />
                            {selectedCollapse == 1 ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        <Collapse in={selectedCollapse == 6} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <Link href={'/pages/discounts'}>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemIcon>
                                            <Discount />
                                        </ListItemIcon>
                                        <ListItemText primary="Discounts" />
                                    </ListItemButton>
                                </Link>
                                <Link href={'/pages/freeIssues'}>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemIcon>
                                            <ShoppingBag />
                                        </ListItemIcon>
                                        <ListItemText primary="Free Issues" />
                                    </ListItemButton>
                                </Link>
                            </List>
                        </Collapse>
                    </React.Fragment>
                }
            </List>
        </Stack>
    )
}
