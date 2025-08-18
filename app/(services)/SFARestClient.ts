"use client"

let BASE_URL = process.env.NEXT_PUBLIC_REST_API_BASE_URL;



export async function retriewAllROutPlans(itineryRequest: any): Promise<any | null> {
    try {
        const response = await fetch(BASE_URL + '/findAllRootPlans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(itineryRequest),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function retriewUserRoles(authToken: string): Promise<any | null> {
    try {
        const response = await fetch(BASE_URL + '/e2/user/services/getUserRole', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': authToken
            },
            body: JSON.stringify({}),
        });

        if (response.ok) {
            const data = await response.json();
            if (data?.responseObject != null) {
                return data.responseObject;
            } else {
                return null;
            }
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function findSupervisorListByRole(token: string, userDetails: any) {
    try {

        const response = await fetch(BASE_URL + '/e2/user/services/findSupervisorListByRole', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(userDetails),
        });

        if (response.ok) {
            const data = await response.json();
            if (data?.responseObject != null) {
                return data.responseObject;
            } else {
                return null;
            }
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function getUmBranches(token: string, companyId: any) {
    try {

        const response = await fetch(BASE_URL + '/findBranches', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify({ compId: companyId, tokenString: token }),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function findAllAreaHirachy(req: any) {
    try {

        const response = await fetch(BASE_URL + '/findAllAreaHierarchy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function findRootsByHierarchy(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/e2/company/findRootsByHierarchy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function addUser(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/e2/user/services/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function deleteUser(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/e2/user/services/deactivate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function updateUser(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/e2/user/services/modify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}


export async function findAllDisPointsNew(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/findAllDisPointsNew', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function retrivewDistributors(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/e2/user/services/findUserByRole', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function addDistributorStore(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/addPoints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function updateDisPoint(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/updateDisPoint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function retriewCompanyList(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/e2/company/company_list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function createBranch(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/e2/company/createBranch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function updateBranch(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/e2/company/updateBranch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function retriewCompanyObjList(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/e2/company/company_obj_list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function findClientCompany(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/e2/company/findClientCompany', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function createCompany(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/e2/company/createCompanay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function modifyCompany(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/e2/company/modifyCompanay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function deleteCompany(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/e2/company/deleteCompanay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function finAllRootPlans(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/e2/company/findAllRootPlansNew', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function createRoutePlan(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/addRootPlan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function updateRootPlanById(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/e2/company/updateRootPlanById', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function deleteRouteByID(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/e2/company/deleteRootPlanById', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}


export async function retriewRoutToShopDetails(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/findSalesPointByRouteId', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function retriewItinTemplates(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/findAllTemplates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function retriewAllAvailableItinerary(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/findAllItinerary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function previewTemplateToMonth(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/AddDateToTemplateTemp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}


export async function addTemplateToMonth(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/AddDateToTemplate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function getAllShops(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/findAllSalesPoints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function findShopCategoryByCompanyId(token: string, req: any) {
    try {

        const response = await fetch(BASE_URL + '/findShopCategoryByCompanyId', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function createSalesPoint(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/addSalesPoint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function updateSalesPoint(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/updateSalesPoint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function retriewRoutSalespointMap(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/findRouteSalesPointsMap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function createItineraryTemplate(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/addTemplateRouteMap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function saveItineraryTemplate(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/AddItineraryTemplate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function saveAnualLeavePlan(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/addLeavePlan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function retrieveAllProductCategories(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/findAllProductCategory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function addProductCategory(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/addProductCategory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function addProductRequest(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/addDisProduct', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function productCode(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/selectAllDisProduct', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function getBatchByProductCode(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/findBatchByProductCode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function addBatch(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/addDisBatch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function retriewAllDistributors(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/findAllDisPoints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function retrieveAllStoksForTheStore(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/findStock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function addNewGRN(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/generateGrn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function getGINByUser(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/findGrn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function updateGRNbyDistributor(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/updateGrn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function retriewAllProducts(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/selectAllDisProduct', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function findIteneryList(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/findAllSalesPoints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function retriveStockByProductCode(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/selectStockByProductCode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function addOrder(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/addOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function findAllOrders(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/findAllOrders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function findAllInvoices(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/findAllInvoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function findDistributors(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/findAllSalesPoints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function retriewAllSellableProductsForStock(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/findProductByStoreId', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function retrieveAllDiscountsByProductCode(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/selectDiscountByProductCode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function selectFreeIssueByProduct(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/findFreeIssueByProductCode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function addInvoice(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/addInvoiceMobile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function findAllReturnInvoices(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/findAllReturnInvoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function retriewAllSellableProducts(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/selectAllSaleableProducts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function validateReturnBatchID(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/validateReturnsBatchId', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function findBatchByCode(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/findBatchByCode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function addReturnInvoices(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/addReturnInvoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function findPaymentDueInvoices(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/findPaymentDueInvoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function savePayments(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/addPaidAmount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function addDiscount(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/addDiscountQuant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function selectAllDiscountByPro(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/selectAllDiscountByProductCode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function updateDiscount(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/updateDiscount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function deleteDiscount(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/deleteDiscount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function saveFreeIsues(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/addFreeIsssue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function selectFreeIssue(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/findFreeIssueByProductCode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function updateFreeIssue(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/updateFreeIssue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function deleteFreeIssue(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/deleteFreeIssue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function retriewAllTemplatesToApprove(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/findPendingTemplateApproval', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function updateAllTemplatesToApprove(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/UpdateTemplateApprovalStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function updateBatch(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/updateBatch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function findManagerAssignedTemplates(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/findManagerAssignedTemplates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function findUserAssignedTemplates(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/findUserAssignedTemplates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function changePasswordRequest(token: string, req: any) {
    try {
 
        const response = await fetch(BASE_URL + '/e2/login/changePassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode': token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            return data 
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}



















export async function googleAPI(query: any) {
    // Get query from request
    const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${'AIzaSyAKG6VTLfpdRId7P25GJE1B3wyn418U4hs'}`, {
            method: 'GET',
            // headers: {
            //     'Content-Type': 'application/json',
            //     "Access-Control-Allow-Origin": "*",
            //     "Access-Control-Allow-Methods": "GET, OPTIONS",
            //     "Access-Control-Allow-Headers": "Content-Type",

            // },
        }
        );

        if(response.ok){
            const data = await response.json();
            return data;
        } else {
            return null;
        }

    } catch (error) {
        console.log(error)
        return null;

    }
}



