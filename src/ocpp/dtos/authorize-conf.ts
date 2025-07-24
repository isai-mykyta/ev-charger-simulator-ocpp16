import { Type } from "class-transformer";
import { 
  IsDateString, 
  IsEnum, 
  IsNotEmpty, 
  IsObject, 
  IsOptional, 
  IsString, 
  ValidateNested
} from "class-validator";

import { AuthorizationStatus } from "../types";

export class IdTagInfoDto {
  @IsDateString()
  @IsOptional()
  public expiryDate?: string;

  @IsString()
  @IsOptional()
  public parentIdTag?: string;

  @IsNotEmpty()
  @IsEnum(AuthorizationStatus)
  public status: AuthorizationStatus;
}

export class AuthorizeConfDto {
  @IsObject()
  @ValidateNested()
  @Type(() => IdTagInfoDto)
  public idTagInfo: IdTagInfoDto;
}
