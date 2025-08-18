"use client"
import AlertProp from '@/app/(components)/(Alerts)/AlertProp';
import GlobalAlert from '@/app/(components)/(Alerts)/GlobalAlert';
import PrimaryButton from '@/app/(components)/(Buttons)/PrimaryButton';
import PageContent from '@/app/(components)/(Page)/PageContent'
import { UserRole } from '@/app/(enums)/UserRole';
import { createItineraryTemplate, retriewRoutSalespointMap } from '@/app/(services)/SFARestClient';
import { alphanumericCharactersRegex } from '@/app/regex';
import { getRole, getToken } from '@/app/util/UserDataHandler';
import { Checkbox, Grid2, IconButton, InputLabel, List, ListItem, ListItemButton, ListItemIcon, ListItemText, TextField } from '@mui/material';
import { redirect } from 'next/navigation';
import React, { useEffect, useLayoutEffect, useState } from 'react'


interface FieldErrors {
  selectedRoutes: string;
  selectedShops: string;
  itineraryName: string;
}

export default function CreateItinerary() {

  /////////////////// New Validation /////////////////////
  const initialErrors: FieldErrors = {
    selectedRoutes: "",
    selectedShops: "",
    itineraryName: "",
  }

  const [fieldErrors, setfieldErrors] = useState<FieldErrors>({ ...initialErrors });

  const validateForm = () => {
    const newErrors: Partial<FieldErrors> = {};
    setfieldErrors(initialErrors);

    if (!itineraryName) {
      newErrors.itineraryName = "Itinerary name cannot be empty";
    } else if (itineraryName.trim().length == 0) {
      newErrors.itineraryName = "Itinerary name cannot be empty";
    } else if (itineraryName.length > 50) {
      newErrors.itineraryName = "Itinerary name cannot exceed 50 characters"
    } 

    if(selectedRoutes.length === 0){
      newErrors.selectedRoutes = "At least one route must be selected";
    }

    if(selectedShops.length === 0){
      newErrors.selectedShops = "At least one shop must be selected";
    }

    
    setfieldErrors((prevErrors) => ({
      ...prevErrors,
      ...newErrors,
    }));

    return Object.keys(newErrors).length === 0;
  }

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
        role == UserRole.SALES_REP)) {
        redirect('/pages/dashboard')
      }
    }
  }, [role]);


  ///////////////////// Attributes ///////////////////////
  const [globalRoutSalesPointMap, setGlobalRoutSalesPointMap] = useState<any[]>([]);
  const [globalRoutes, setGlobalRoutes] = useState<any[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<any[]>([]);
  const [selectedShops, setSelectedShops] = useState<any[]>([]);
  const [availableShops, setAvailableShops] = useState<any[]>([]);
  const [itineraryName, setItineraryName] = useState<any>("");

  //////////////////////// Init //////////////////////////
  useEffect(() => {

    const init = async () => {
      const tempResponse = await retriewRoutSalespointMap(token, { tokenString: token });

      if (tempResponse.success) {
        const routeSalesPointList = tempResponse.routeSalesPointList;
        setGlobalRoutSalesPointMap(routeSalesPointList);
        const routes = routeSalesPointList.map((route: any) => route.cfgRootPlan);
        setGlobalRoutes(routes);
      } else {
        setGlobalRoutSalesPointMap([]);
        setGlobalRoutes([])
      }
    };

    if (token) {
      init();
    }
  }, [token, reload]);


  const handleRouteChange = (value: number) => () => {
    const currentIndex = selectedRoutes.indexOf(value);
    const newChecked = [...selectedRoutes];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setSelectedRoutes(newChecked);
  };


  const handleChangeShop = (value: number) => () => {
    const currentIndex = selectedShops.indexOf(value);
    const newChecked = [...selectedShops];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setSelectedShops(newChecked);
  };

  useEffect(() => {
    // setAvailableShops([]);
    let tempSalesPoint: any[] = [];
    for (let selectedRouteId of selectedRoutes) {
      for (let tempRouteList of globalRoutSalesPointMap) {
        if (tempRouteList.cfgRootPlan.id == selectedRouteId) {
          if (tempRouteList.salesPointsList != null) {
            tempSalesPoint = [...tempSalesPoint, ...tempRouteList.salesPointsList]
          }
        }
      }
    }

    /////// Remove Old Selected Shop //////////
    let newShopIds = tempSalesPoint.map(i => i.id)
    let tempSelectedShops: any[] = selectedShops.filter(i => newShopIds.includes(i));

    setSelectedShops(tempSelectedShops)
    setAvailableShops(tempSalesPoint)


  }, [selectedRoutes]);


  //////////////////////// API Calls //////////////////////////
  const onCreate = async () => {

    if (!validateForm()) {
      return;
    }

    let templateRoutSalesPointMap: any[] = [];
    let routeIDList: any[] = [];
    for (let selectedRouteId of selectedRoutes) {
      let tempObject: any = {};
      let tempSalesPointsList: any[] = [];
      for (let tempRouteList of globalRoutSalesPointMap) {
        if (tempRouteList.cfgRootPlan.id == selectedRouteId) {
          routeIDList.push(parseInt(selectedRouteId));
          for (let selectedShopId of selectedShops) {
            for (let tempSalesPoint of tempRouteList.salesPointsList) {
              if (tempSalesPoint.id == selectedShopId && selectedRouteId === tempSalesPoint.routeId) {
                tempSalesPointsList.push(tempSalesPoint);
              }
            }
          }
          tempObject.cfgRootPlan = tempRouteList.cfgRootPlan;
          tempObject.salesPointsList = tempSalesPointsList;
          break;
        }
      }
      templateRoutSalesPointMap.push(tempObject);
    }

    let templateRouteMapList: any[] = [];
    let itinTemplate: any = {
      itineraryName: itineraryName
    };

    for (let tempObject of templateRoutSalesPointMap) {
      let tempRouteMapDto: any = {};
      let tempShopList: any[] = [];
      for (let tempSalesPoint of tempObject.salesPointsList) {
        tempRouteMapDto.routeId = tempSalesPoint.routeId;
        let tempshopMap: any = {
          shopId: tempSalesPoint.id
        };
        tempShopList.push(tempshopMap);
      }
      tempRouteMapDto.routeShopMapList = tempShopList;
      tempRouteMapDto.effectiveDate = null;
      templateRouteMapList.push(tempRouteMapDto);
    }

    let tempRequest: any = {
      tokenString: token,
      itinTemplate: itinTemplate,
      templateRouteMapList: templateRouteMapList
    };

    const res = await createItineraryTemplate(token, tempRequest);
    if (res?.success === true) {
      clearInputs()
      setAlert({
        open: true,
        type: "success",
        message: "New itinerary has been successfully created.",
      });
      setReload(!reload)
    } else {
      setAlert({
        open: true,
        type: "error",
        message: "Creation of new itinerary has been failed.",
      });
    }
  }


  /////////////////////// Helpers ///////////////////////////
  const clearInputs = () => {
    setSelectedRoutes([]);
    setSelectedShops([]);
    setItineraryName("");
  }

  //////////////////// ERRORS //////////////////////////////
  // const [errors, setErrors] = useState({
  //   itineraryName: false,
  //   selectedRoutes: false,
  //   selectedShops: false,
  // });

  // const validateForm = () => {
  //   const newErrors = {
  //     itineraryName: !itineraryName.trim(), // Check if itineraryName is empty
  //     selectedRoutes: selectedRoutes.length === 0, // Check if no routes are selected
  //     selectedShops: selectedShops.length === 0, // Check if no shops are selected
  //   };

  //   setErrors(newErrors);

  //   return !Object.values(newErrors).some(error => error);
  // };


  return (
    <PageContent title="Create Itinerary">
      <GlobalAlert alert={alert} setAlert={setAlert} />
      <Grid2 container width={'100%'} display={'flex'} alignItems={'center'} mt={3} spacing={2}>
        <Grid2 size={{ xs: 12, sm: 12, md: 2, lg: 2, xl: 2 }} sx={{ maxWidth: '150px' }} >
          <InputLabel sx={{ fontWeight: 'bold' }}>Itinerary Name*</InputLabel>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
          <TextField
            value={itineraryName || ""}
            onChange={(e) => setItineraryName(e.target.value)}
            label="Itinerary Name*"
            fullWidth
            size='small'
            error={Boolean(fieldErrors.itineraryName)}
            helperText={fieldErrors.itineraryName}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
          <PrimaryButton onClick={onCreate} label="Create Itinerary" size='large' />
        </Grid2>
      </Grid2>
      <Grid2 container spacing={2} width={'100%'} mt={3}>
        <Grid2 sx={{ border: '2px solid rgba(0, 0, 0, 0.32)', borderRadius: '20px', p: 2 }} size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }} display={'flex'} justifyContent={'center'} direction={'column'}>
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            <InputLabel sx={{ fontWeight: 'bold', mb: 1 }}>Available Routes*</InputLabel>
            {fieldErrors.selectedRoutes && <span style={{ color: 'red', fontSize: '0.75rem' }}>At least one route must be selected</span>}
            {globalRoutes?.map((value) => {
              const labelId = `checkbox-list-label-${value.rootName}`;

              return (
                <ListItem
                  key={value.id}
                  disablePadding
                >
                  <ListItemButton role={undefined} onClick={handleRouteChange(value.id)} dense>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={selectedRoutes.includes(value.id)}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </ListItemIcon>
                    <ListItemText id={labelId} primary={value.rootName} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Grid2>
        <Grid2 sx={{ border: '2px solid rgba(0, 0, 0, 0.32)', borderRadius: '20px', p: 2 }} size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }} display={'flex'} justifyContent={'center'} direction={'column'}>
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            <InputLabel sx={{ fontWeight: 'bold', mb: 2 }}>Available Shops*</InputLabel>
            {fieldErrors.selectedShops && <span style={{ color: 'red', fontSize: '0.75rem' }}>At least one shop must be selected</span>}
            {availableShops?.map((value) => {
              const labelId = `checkbox-list-label-${value.shopName}`;

              return (
                <ListItem
                  key={value.id}
                  disablePadding
                >
                  <ListItemButton role={undefined} onClick={handleChangeShop(value.id)} dense>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={selectedShops.includes(value.id)}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </ListItemIcon>
                    <ListItemText id={labelId} primary={value.shopName} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Grid2>
      </Grid2>
    </PageContent>
  )
}
