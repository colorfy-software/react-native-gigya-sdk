export default function <ParamsType extends unknown>(params: ParamsType): string {
  return JSON.stringify(params, (key: string, value: string) =>
    /**
     * NOTE: Stringifies params from:
     *
     * { profile: { firstName: 'Test', lastName: 'LastName' }, lang: 'en' }
     *
     * to:
     *
     * {"profile":"{\"firstName\":\"Test\",\"lastName\":\"LastName\"}","lang":"en"}
     *
     * instead of:
     *
     * {"profile":{"firstName":"Test","lastName":"LastName"},"lang":"en"}
     *
     * tldr: making sure that, once the whole params argument has been parsed on the native side,
     * nested objects will come out as JSON strings and not objects.
     */
    key && typeof value === 'object' ? JSON.stringify(value) : value
  )
}
