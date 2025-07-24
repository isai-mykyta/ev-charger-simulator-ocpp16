import { Type } from "class-transformer";
import { IsObject, ValidateNested } from "class-validator";

import { IdTagInfoDto } from "./authorize-conf";

export class StopTransactionConfDto {
  @IsObject()
  @ValidateNested()
  @Type(() => IdTagInfoDto)
  public idTagInfo: IdTagInfoDto;
}
