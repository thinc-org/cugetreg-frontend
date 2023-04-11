import { BadRequestException, Controller, Get, Logger, Post, Query, Req, Res } from '@nestjs/common'

import { Request, Response } from 'express'

import { SkipAuth } from '@admin-api/common/decorators/SkipAuth'

import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  logger: Logger
  constructor(private readonly authService: AuthService) {
    this.logger = new Logger('Auth Controller')
  }

  @Get()
  @SkipAuth()
  async sayHello() {
    return 'Hello'
  }

  @Get('/validateCode')
  @SkipAuth()
  async auth(@Query() query, @Res() res: Response) {
    if (!query.code) {
      throw new BadRequestException('authentication code is required')
    }

    const payload = await this.authService.verifyAuthenticationCode(query.code)

    if (!payload || !payload.id_token) {
      throw new BadRequestException('Authentication code is invalid')
    }

    const id_token = payload.id_token

    const userInfo = await this.authService.validateIdToken(id_token)

    if (!userInfo) {
      throw new BadRequestException('Invalid Id token')
    }

    try {
      const access_token = await this.authService.issueAccessToken(userInfo)

      this.setCookie(res, 'access_token', access_token)

      return res.status(200).json({ message: 'Validate code successfully' })
    } catch (err) {
      this.logger.error(
        'Error occurs in validating code (could be issue access token or setting cookie)'
      )
      return res.status(400).json({ message: 'Something went wrong' })
    }
  }

  // TODO: Test this route
  @Post('/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    res.clearCookie('accessToken')
  }

  // @Post('/accesstoken')
  // async getAccessToken(@Req() req: Request) {
  //   const token = req.cookies['accessToken']
  //   if (!token) throw new BadRequestException('Not logged in')
  //   return {
  //     accessToken: await this.authService.issueAccessToken(token),
  //   }
  // }

  @Get('me')
  async getUserInfo(@Req() req: Request, @Res() res: Response) {
    return res.json(req['user'])
  }

  // TODO: lessen expiry
  private setCookie(
    res: Response,
    name: string,
    value: string,
    httpOnly = true,
    maxAge = 1000 * 60 * 60 * 24 * 30 * 6
  ) {
    res.cookie(name, value, {
      httpOnly,
      maxAge,
      secure: true,
    })
  }
}
