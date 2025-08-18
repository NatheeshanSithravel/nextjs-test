"use client"
import { CSSObject, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { useTreeItem2, UseTreeItem2Parameters } from '@mui/x-tree-view/useTreeItem2';
import {
  TreeItem2Content,
  TreeItem2IconContainer,
  TreeItem2GroupTransition,
  TreeItem2Label,
  TreeItem2Root,
  TreeItem2Checkbox,
} from '@mui/x-tree-view/TreeItem2';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import { TreeItem2Provider } from '@mui/x-tree-view/TreeItem2Provider';
import { Grow, IconButton, InputLabel, Stack } from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { Dispatch, forwardRef, SetStateAction, useEffect, useState } from 'react';
import RootPlanDialog from './RootPlanDialog';
import DeleteRootDialog from './DeleteRootDialog';
import { getRole } from '@/app/util/UserDataHandler';
import { UserRole } from '@/app/(enums)/UserRole';

interface TreeProps {
  setReload: Dispatch<SetStateAction<boolean>>;
  reload: boolean;
  treeNodes: any[];
  hierarchyMap?: Map<number, string>;
  selectedId: number | null;
  setselectedId: Dispatch<SetStateAction<number | null>>;
}

const CustomTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
}));

interface CustomTreeItemProps
  extends Omit<UseTreeItem2Parameters, 'rootRef'>,
  Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> {
  areahierarchy?: string,
  actions: React.ReactNode
}

const CustomTreeItem = forwardRef(function CustomTreeItem(
  props: CustomTreeItemProps,
  ref: React.Ref<HTMLLIElement>,
) {
  const { id, itemId, label, disabled, children, ...other } = props;

  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getCheckboxProps,
    getLabelProps,
    getGroupTransitionProps,
    status,
  } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });

  return (
    <TreeItem2Provider itemId={itemId}>
      <TreeItem2Root {...getRootProps(other)} sx={treeItemStyle}>
        <Stack direction={'row'} display={'flex'} width={'100%'} alignItems={'center'}>
          <CustomTreeItemContent {...getContentProps()}>
            <TreeItem2IconContainer {...getIconContainerProps()}>
              <TreeItem2Icon status={status} />
            </TreeItem2IconContainer>
            <TreeItem2Checkbox {...getCheckboxProps()} />
            <Box >
              <TreeItem2Label sx={{ fontWeight: 'bold' }} {...getLabelProps()} />
            </Box>
            <InputLabel sx={{ fontStyle: 'italic', float: 'left' }}>({props.areahierarchy})</InputLabel>

          </CustomTreeItemContent>
          {props.actions}
        </Stack>

        {children && <TreeItem2GroupTransition {...getGroupTransitionProps()} />}
      </TreeItem2Root>
    </TreeItem2Provider>
  );
});




export default function CustomTree({ reload, setReload, treeNodes, hierarchyMap, selectedId, setselectedId }: TreeProps) {


  const [role, setrole] = useState<any>(null);

  useEffect(() => {
    const getData = async () => {
      setrole(await getRole());
    };
    getData();
  }, []);


  const generateChildTree = (root: any) => {
    let childNodes: any[] = root.children;
    return childNodes.map(
      child =>
        <Stack direction={'row'} key={child.id} display={'flex'} gap={1} >
          <CustomTreeItem itemId={child.id} label={child.rootName} areahierarchy={hierarchyMap?.get(child.areaHierachy)} onClick={() => setselectedId(child.id)}
            actions={
              <Stack direction={'row'} height={'0'} >
                {child.areaHierachy != 7 &&
                  (role == UserRole.SUPER_ADMIN || role == UserRole.COOP_ADMIN) &&
                  <>


                    <RootPlanDialog
                      reload={reload}
                      setReload={setReload}
                      create={true}
                      parent={child}
                      hierarchyMap={hierarchyMap}
                    />

                    <RootPlanDialog
                      reload={reload}
                      setReload={setReload}
                      edit={true}
                      parent={child}
                      hierarchyMap={hierarchyMap}
                    />
                    {!child.children &&
                      <DeleteRootDialog
                        reload={reload}
                        setReload={setReload}
                        root={child}

                      />
                    }
                  </>
                }
              </Stack>
            }
          >
            {child.children && generateChildTree(child)}
          </CustomTreeItem>

        </Stack>
    )

  }


  return (
    <SimpleTreeView defaultExpandedItems={['3']}>
      {treeNodes?.map((root) =>
        <Stack direction={'row'} key={root.id} display={'flex'} gap={1}>
          <CustomTreeItem areahierarchy={hierarchyMap?.get(root.areaHierachy)} itemId={root.id} label={root.rootName} onClick={() => setselectedId(root.id)}
            actions={<Stack direction={'row'} height={'0'} >
              {(role == UserRole.SUPER_ADMIN || role == UserRole.COOP_ADMIN) &&
                <>
                  <RootPlanDialog
                    reload={reload}
                    setReload={setReload}
                    create={true}
                    parent={root}
                    hierarchyMap={hierarchyMap}
                  />

                  <RootPlanDialog
                    reload={reload}
                    setReload={setReload}
                    edit={true}
                    parent={root}
                    hierarchyMap={hierarchyMap}
                  />
                  {!root.children &&
                    <DeleteRootDialog
                      reload={reload}
                      setReload={setReload}
                      root={root}

                    />
                  }
                </>
              }
            </Stack>}
          >
            {root.children && generateChildTree(root)}
          </CustomTreeItem>

        </Stack>
      )}
    </SimpleTreeView>
  );
}

const treeItemStyle: CSSObject = {
  // backgroundColor:'red',
  '& .MuiBox-root': {

  }

}
