"use client"
import PageContent from '@/app/(components)/(Page)/PageContent'
import { Collapse, FormControl, Grid2, Grow, IconButton, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { createBranch, finAllRootPlans, findAllAreaHirachy, retriewCompanyList } from '@/app/(services)/SFARestClient';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { Add, Delete, Edit } from '@mui/icons-material';
import CustomTree from './(components)/CustomTree';
import RootPlanDialog from './(components)/RootPlanDialog';
import { getRole, getToken } from '@/app/util/UserDataHandler';
import { UserRole } from '@/app/(enums)/UserRole';
import { redirect } from 'next/navigation';

export default function LocationBoundary() {

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
                role == UserRole.SALES_REP
            )) {
                redirect('/pages/dashboard')
            }
        }
    }, [role]);


    // useLayoutEffect(() => {
    //     if (typeof window !== "undefined") {
    //         settoken(sessionStorage.getItem("token"))
    //         setcompanyId(sessionStorage.getItem("token")?.split(":")[4])
    //     }
    // }, []);


    ///////////////////// Attributes ////////////////////
    const [globalHierachyList, setglobalHierachyList] = useState<any[]>([]);
    const [globalRootPlan, setglobalRootPlan] = useState<any[]>([]);
    const [rootPlanTree, setrootPlanTree] = useState<any[]>([]);
    const [hierarchyMap, sethierarchyMap] = useState<Map<number, string>>();


    ///////////////////// Init ////////////////////////
    useEffect(() => {
        const init = async () => {
            const resArea = await findAllAreaHirachy({ tokenString: token })
            if (resArea?.success === true) {
                setglobalHierachyList(resArea?.areaHierarchyList)
            } else {
                setglobalHierachyList([])
            }

            const rootPlanRes = await finAllRootPlans(token, {});
            if (rootPlanRes?.success) {
                setglobalRootPlan(rootPlanRes?.rootPlans);
            } else {
                setglobalRootPlan([])
            }


        }
        if (token) {
            init();
        }
    }, [token, reload]);

    useEffect(() => {
        const generateTree = () => {
            let areaMap = new Map<number, string>();
            for (let i of globalHierachyList) {
                areaMap.set(i.id, i.categoryName)
            }
            sethierarchyMap(areaMap)

            let allNodes = globalRootPlan.sort((a, b) => a.areaHierachy - b.areaHierachy);

            while (true) {
                let node = allNodes.pop(); // Get the last node
                if (node.areaHierachy === 1) {
                    allNodes.push(node); // Push it back if it meets the condition
                    break;
                }

                // Use `find` to get the single parent node
                let parentNode = allNodes.find(p => p.id === node.rootParentID);

                if (!parentNode) {
                    console.error(`Parent node with id ${node.rootParentID} not found`);
                    break;
                }

                // Get the index of the parent node
                let parentIndex = allNodes.indexOf(parentNode);

                // Initialize or update the `children` array in the parent node
                if (parentNode.children) {
                    parentNode.children.push(node);
                } else {
                    parentNode.children = [node];
                }

                // Update the parent node in the array
                allNodes[parentIndex] = parentNode;
            }

            setrootPlanTree(allNodes)
        }

        if ((globalHierachyList && globalHierachyList.length > 0) && (globalRootPlan && globalRootPlan.length > 0)) {
            generateTree();
        }
    }, [globalHierachyList, globalRootPlan]);

    //////////////////// Helpers /////////////////////
    const clearInputs = () => {

    }



    ///////////////////// API CALLS /////////////////////

    const onCreate = async () => {
        let branch: any = {

        }

        let res: any = await createBranch(token, branch);
        if (res?.state === 0) {
            setAlert({
                open: true,
                type: "success",
                message: "Branch created successfully",
            });
            clearInputs();
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Failed to create the Branch",
            });
        }
    }

    const [selectedId, setselectedId] = useState<number | null>(null);


    return (
        <PageContent title='Location Boundaries'
            action={
                (role == UserRole.SUPER_ADMIN || role == UserRole.COOP_ADMIN) &&
                <RootPlanDialog
                    reload={reload}
                    setReload={setReload}
                    create={true}
                    parent={{}}
                    hierarchyMap={hierarchyMap}
                />}>
            <GlobalAlert alert={alert} setAlert={setAlert} />
            <Stack width={'100%'} gap={1} mt={0} >
                <CustomTree
                    reload={reload}
                    setReload={setReload}
                    hierarchyMap={hierarchyMap}
                    treeNodes={rootPlanTree}
                    selectedId={selectedId}
                    setselectedId={setselectedId} />
            </Stack>
        </PageContent>
    )
}
