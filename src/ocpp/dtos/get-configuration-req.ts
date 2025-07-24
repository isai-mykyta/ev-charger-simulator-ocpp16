import { IsArray, IsOptional, IsString, Length } from "class-validator";

export class GetConfigurationReqDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Length(1, 50, { each: true })
  public key?: string[];
}
