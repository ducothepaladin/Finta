type ApiMeta = {
  endpoint: string
  method: string
}

type SuccessResponseArgs<T> = {
  code?: number
  meta: ApiMeta
  data?: T
  message: string
}

export function successResponse<T>({
  code = 200,
  meta,
  data = {} as T,
  message,
}: SuccessResponseArgs<T>) {
  return {
    success: 1,
    code,
    meta,
    data,
    message,
  }
}
