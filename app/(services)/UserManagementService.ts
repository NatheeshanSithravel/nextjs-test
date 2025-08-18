"use server"


let BASE_URL = process.env.NEXT_PUBLIC_REST_API_BASE_URL;

export async function authenticate(username: string, password: string) {
    try {
        const response = await fetch(BASE_URL + '/e2/login/authentication', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode':""
            },
            body: JSON.stringify({
                usreName: username,
                password: password,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}

export async function registerDoctor(form:FormData) {
    try {
    
        const response = await fetch(BASE_URL + '/auth/registerDoctor', {
            method: 'POST',
            headers: {
                // 'Authorization': `Bearer ${token}`, 
            },
            body: form
        });
        if (response.ok) {
            const data = await response.json();
            return data;
        } else if(response.status == 403){
            const data = await response.json();
            return data;
        } else {
            return null;
        }
    } catch (error) {
        console.error(error)
    }
}




export async function viewUser(companyId:number, token:string, userStatus:any) {
    try {
        const req:any = {
            companyId:companyId,
            uStatus:userStatus
        }
        const response = await fetch(BASE_URL + '/e2/user/services/viewUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AuthCode':token
            },
            body: JSON.stringify(req),
        });

        if (response.ok) {
            const data = await response.json();
            if(data?.responseObject != null){
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





