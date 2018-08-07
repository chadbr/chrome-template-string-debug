import { UserService } from './user.service';
import { Injectable } from '@angular/core';
import { HttpParams, HttpClient } from '@angular/common/http';

export class Crud {
  constructor(
    readonly read: boolean,
    readonly modify: boolean,
    readonly create?: boolean,
    readonly destroy?: boolean) { }
}

export class UserWellRoles {
  constructor(
    readonly wellId: string,
    readonly userId: string,
    readonly roles?: Array<string>) { }
}

export class SimplePermission {
  constructor(
    readonly id: string,
    readonly value: boolean
  ) { }
}

export class DataPermission {
  constructor(
    readonly entityId: string,
    readonly permissions: Crud
  ) { }
}

export class APIPermission {
  constructor(
    readonly namespace: string,
    readonly endpoints: Map<string, SimplePermission>
  ) { }
}

export class RolePermissions {
  constructor(
    readonly data: Map<string, DataPermission>,
    readonly ui: Map<string, SimplePermission>,
    readonly api: Map<string, APIPermission>
  ) {

  }
}

export interface IUser {
  userId: string;
  email?: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  link?: string;
  pictureURI?: string;
  authorized?: boolean;
  roles?: Array<string>;

}
export class User implements IUser {
  constructor(
    readonly userId: string,
    readonly email?: string,
    readonly name?: string,
    readonly givenName?: string,
    readonly familyName?: string,
    readonly link?: string,
    readonly pictureURI?: string,
    public authorized?: boolean,
    readonly roles?: string[]
  ) {
    this.authorized = authorized || false;
  }
}


@Injectable()
export class PermissionService {

  static loaded = false;
  static roleLookup: Map<string, RolePermissions> = new Map<string, RolePermissions>();
  // static logger: LoggerService = null;
  static userService: UserService;

  constructor(
    private userService: UserService,
    private http: HttpClient) {
    PermissionService.userService = this.userService;
  }

  public static async ensureLoaded(): Promise<void> {
    if (PermissionService.loaded !== true) {
      PermissionService.roleLookup = new Map<string, RolePermissions>();
      const json:
        {
          roles: [
            {
              name: string,
              comment: string,
              ui: [{
                id: string,
                value: boolean
              }],
              data: [
                {
                  entityId: string,
                  crud: {
                    read: boolean,
                    modify: boolean,
                    create?: boolean,
                    destroy?: boolean
                  }
                }
              ],
              api: [
                {
                  namespace: string,
                  endpoints: [
                    {
                      id: string,
                      value: boolean
                    }
                  ]
                }
              ]
            }
          ]
        } = await PermissionService.userService.getPermissionJson();
    }
    return;
  }

  public checkAPIPermission(user: User, namespace: string, endpoint: string): boolean {

    let retVal = false;

    if (user.roles) {
      for (const role of user.roles) {
        if (PermissionService.roleLookup.has(role)) {
          const rolePerms = PermissionService.roleLookup.get(role);
          if (rolePerms) {
            if (rolePerms.api.has(namespace)) {
              const apiPerm = rolePerms.api.get(namespace);
              if (apiPerm) {
                if (apiPerm.endpoints.has(endpoint)) {
                  const canCallEndpoint = apiPerm.endpoints.get(endpoint);
                  if (canCallEndpoint) {
                    retVal = canCallEndpoint.value;
                    if (retVal === true) {
                      break;
                    }
                  }
                } else {
                  // PermissionService.logger.debug(`Unknown endpoint ${endpoint}`);
                  console.log(`Unknown endpoint ${endpoint}`);
                }
              }
            } else {
              // PermissionService.logger.debug(`Unknown namespace ${namespace}`);
              console.log(`Unknown namespace ${namespace}`);
            }
          }
        } else {
          // PermissionService.logger.debug(`Unknown role ${role}`);
          console.log(`Unknown role ${role}`);
        }
      }
    }

    return retVal;
  }


  public canReadDataType(user: IUser, dataType: string): boolean {
    PermissionService.ensureLoaded();

    let retVal = false;

    if (user.roles !== undefined) {
      retVal = this.canReadDataTypeFromRoles(user.roles, dataType);
    }

    return retVal;
  }

  private canReadDataTypeFromRoles(roles: Array<string>, dataType: string): boolean {
    PermissionService.ensureLoaded();

    let retVal = false;

    for (const role of roles) {
      const crud: Crud = this.getDataPermission(role, dataType);
      retVal = crud.read;
      if (retVal === true) {
        break;
      }
    }

    return retVal;
  }

  private getDataPermission(role: string, dataType: string): Crud {
    PermissionService.ensureLoaded();

    let retVal: Crud = new Crud(false, false, false, false);

    if (PermissionService.roleLookup.has(role)) {
      const rolePerms = PermissionService.roleLookup.get(role);
      if (rolePerms && rolePerms.data.has(dataType)) {
        const dataPerms = rolePerms.data.get(dataType);
        if (dataPerms) {
          retVal = dataPerms.permissions;
        } else {
          console.log(`Data type with no permissions ${dataType}`);
        }
      } else {
        console.log(`Unknown data type ${dataType}`);
      }
    } else {
      console.log(`Unknown role ${role}`);
    }

    return retVal;
  }

}
