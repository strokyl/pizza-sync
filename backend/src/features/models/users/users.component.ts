import { Component } from '@nestjs/common';
import { get } from 'request';

import { NormalizedModel } from '../normalized-model.class';
import { requestOptions } from '../../../helpers/http.helper';
import { IUserWithId, IUserWithoutId } from './users.interface';

@Component()
export class UsersService extends NormalizedModel<IUserWithoutId> {
  constructor() {
    super('userId');
  }

  getUser(username: string): IUserWithId {
    const user = this.allIds
      .map(userId => this.byId[userId])
      .find(userTmp => userTmp.username === username);

    if (user) {
      return user;
    }

    return null;
  }

  getNbConnectionsUser(user: IUserWithId): number {
    if (!!this.byId[user.id]) {
      return this.byId[user.id].nbConnections;
    }

    return 0;
  }

  getNbConnections(): number {
    return this.allIds.length;
  }

  addUser(username: string): Promise<IUserWithId> {
    return new Promise((resolve, reject) => {
      get(
        `https://api.github.com/users/${username}`,
        requestOptions,
        (error, response, body) => {
          const user: IUserWithoutId = {
            username,
            thumbnail: '',
            nbConnections: 0,
            isOnline: false,
          };

          if (!error) {
            try {
              body = JSON.parse(body);
              user.thumbnail = body.avatar_url || '';
            } catch (err) {}
          }

          const newUser = this.create(user);

          resolve(newUser);
        }
      );
    });
  }

  setUserOnline(user: IUserWithId): void {
    if (!this.byId[user.id]) {
      return;
    }

    this.byId[user.id].isOnline = true;
    this.byId[user.id].nbConnections++;
  }

  setUserOffline(user: IUserWithId): void {
    if (!this.byId[user.id]) {
      return;
    }

    this.byId[user.id].isOnline = false;
    this.byId[user.id].nbConnections--;
  }
}