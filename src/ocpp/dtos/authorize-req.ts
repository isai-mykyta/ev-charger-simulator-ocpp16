import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class AuthorizeReqDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  public idTag: string;
}
