// tslint:disable: max-classes-per-file
import { EntityRepository, Repository, SelectQueryBuilder } from "typeorm";
import { User } from "../users/user.entity";
import { Listen } from "./listen.entity";
import { Interval } from "../reports/interval";

export class ListenScopes extends SelectQueryBuilder<Listen> {
  /**
   * `byUser` scopes the query to listens created by the user.
   * @param currentUser
   */
  byUser(currentUser: User): this {
    return this.andWhere(`listen."userId" = :userID`, {
      userID: currentUser.id,
    });
  }

  /**
   * `duringInterval` scopes the query to listens played during the interval.
   * @param interval
   */
  duringInterval(interval: Interval): this {
    return this.andWhere("listen.playedAt BETWEEN :timeStart AND :timeEnd", {
      timeStart: interval.start,
      timeEnd: interval.end,
    });
  }
}

@EntityRepository(Listen)
export class ListenRepository extends Repository<Listen> {
  get scoped(): ListenScopes {
    return new ListenScopes(this.createQueryBuilder("listen"));
  }
}
