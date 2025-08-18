"use client";
import AlertProp from "@/app/(components)/(Alerts)/AlertProp";
import GlobalAlert from "@/app/(components)/(Alerts)/GlobalAlert";
import PrimaryButton from "@/app/(components)/(Buttons)/PrimaryButton";
import PageContent from "@/app/(components)/(Page)/PageContent";
import {
  finAllRootPlans,
  retriewRoutToShopDetails,
} from "@/app/(services)/SFARestClient";
import {
  FormControl,
  FormHelperText,
  Grid2,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  APIProvider,
  Map,
  MapMouseEvent,
  Marker,
} from "@vis.gl/react-google-maps";
import { getRole, getToken } from "@/app/util/UserDataHandler";
import { UserRole } from "@/app/(enums)/UserRole";
import { redirect } from "next/navigation";

export default function DealerStorePage() {
  //////////////////// Alert ////////////////////////
  const [alert, setAlert] = useState<AlertProp>({
    open: false,
    type: "success",
    message: "",
  });


  const [globalRootPlan, setglobalRootPlan] = useState<any[]>([]);
  const [selectedRoot, setselectedRoot] = useState<any>("");
  const [globalShopList, setglobalShopList] = useState<any[]>([]);
  const [filteredShopList, setfilteredShopList] = useState<any[]>([]);
  const [selectedShop, setselectedShop] = useState<any>(null);
  const [searchMode, setsearchMode] = useState<boolean>(false);



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
      if (!(role == UserRole.COOP_ADMIN ||
        role == UserRole.MANAGER ||
        role == UserRole.COORDINATOR ||
        role == UserRole.SALES_REP)) {
        redirect('/pages/dashboard')
      }
    }
  }, [role]);

  useEffect(() => {
    findAllRoutePlan();
  }, [token]);

  ///////////////////// API CALLS /////////////////////
  const findAllRoutePlan = async () => {
    const rootPlanRes = await finAllRootPlans(token, {});
    if (rootPlanRes?.success) {
      setglobalRootPlan(rootPlanRes?.rootPlans);
    } else {
      setglobalRootPlan([]);
    }
  };

  const retiewRouteDataForAsingleID = async () => {
    if (!validateForm()) {
      return;
    }

    setselectedShop(null);
    setsearchMode(false);
    if (selectedRoot != "") {
      let request: any = {
        routeId: selectedRoot,
        tokenString: token,
      };

      let res: any = await retriewRoutToShopDetails(token, request);
      if (res.success === true) {
        setglobalShopList(res.salesPointsList);
        setfilteredShopList(res.salesPointsList);

        if (res.salesPointsList.length > 0) {
          setAlert({
            open: true,
            type: "success",
            message: "Route Retireved Successfully",
          });
        } else {
          setAlert({
            open: true,
            type: "error",
            message: "No availbale shops for selected route",
          });
        }
      } else {
        setAlert({
          open: true,
          type: "error",
          message: "No availbale shops for selected route",
        });
        setglobalShopList([]);
        setfilteredShopList([]);
      }
    }
  };

  //////////////////// Util //////////////////////////
  const search = (value: string) => {
    setsearchMode(true);
    setselectedShop(null);
    if (value != "") {
      let temp = globalShopList.filter((i) =>
        i.shopName?.toLowerCase().includes(value.toLowerCase())
      );
      setfilteredShopList(temp);
    } else {
      setfilteredShopList(globalShopList);
    }
  };

  ///////////////// ERRORS ////////////////////////
  const [errors, setErrors] = useState({
    selectedRoot: false,
  });

  const validateForm = () => {
    const newErrors = {
      selectedRoot: !selectedRoot, // Check if selectedRoot is empty
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error);
  };

  return (
    <PageContent title="View Route">
      <GlobalAlert alert={alert} setAlert={setAlert} />
      <Stack
        width={"100%"}
        direction={"column"}
        display={"flex"}
        alignItems={"center"}
        gap={4}
      >
        <Grid2
          container
          width={"100%"}
          spacing={2}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Grid2 size={{ xs: 12, md: 1 }}>
            <InputLabel>Route ID</InputLabel>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <FormControl size="small" fullWidth error={errors.selectedRoot}>
              <InputLabel>Route ID *</InputLabel>
              <Select
                label="Route ID *"
                value={selectedRoot || ""}
                variant="outlined"
                onChange={(e) => setselectedRoot(e.target.value)}
              >
                {globalRootPlan.map((rootPlan, index) => (
                  <MenuItem key={index} value={rootPlan?.id}>
                    {rootPlan?.id} | {rootPlan?.rootName}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {errors.selectedRoot && (
                  <span>
                    Must select a route
                  </span>
                )}
              </FormHelperText>

            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <PrimaryButton label="View" onClick={retiewRouteDataForAsingleID} />
          </Grid2>
        </Grid2>
        {(filteredShopList.length > 0 || searchMode) && (
          <Grid2
            container
            width={"100%"}
            spacing={2}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Grid2 size={{ xs: 12, md: 3 }} height={"100%"}>
              <InputLabel sx={{ mb: 1, fontWeight: "bold" }}>
                Store List
              </InputLabel>
              <TextField
                label="Search"
                variant="outlined"
                fullWidth
                size="small"
                onChange={(e) => search(e.target.value)}
              />
              <List component="div" disablePadding>
                {filteredShopList?.map((shop) => (
                  <ListItemButton
                    key={shop.id}
                    onClick={() => setselectedShop(shop)}
                  >
                    <ListItemText primary={shop.shopName} />
                  </ListItemButton>
                ))}
              </List>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 9 }}>
              <InputLabel sx={{ mb: 1, fontWeight: "bold" }}>
                Location
              </InputLabel>
              <APIProvider apiKey={"AIzaSyAKG6VTLfpdRId7P25GJE1B3wyn418U4hs"}>
                <Map
                  onClick={(e) => {
                    console.log(e.detail.latLng);
                  }}
                  style={{ width: "100%", height: "50vh" }}
                  defaultCenter={{ lat: 7.7565, lng: 80.5772 }}
                  defaultZoom={8}
                  gestureHandling={"greedy"}
                  disableDefaultUI={true}
                >
                  {selectedShop ? (
                    <Marker
                      position={{
                        lat: Number(selectedShop.latitude),
                        lng: Number(selectedShop.longitude),
                      }}
                    />
                  ) : (
                    filteredShopList?.map((shop) => (
                      <Marker
                        key={shop.id}
                        position={{
                          lat: Number(shop.latitude),
                          lng: Number(shop.longitude),
                        }}
                      />
                    ))
                  )}
                </Map>
              </APIProvider>
            </Grid2>
          </Grid2>
        )}
      </Stack>
    </PageContent>
  );
}
