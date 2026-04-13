export type PToken = {
      type: string,
      $: string
};

export type PRule = {
      regex: string,
      type?: string,
      next?: string
};

export type PState = PRule[]

export type PMachine = Record<string,PState>;

export type RRule = {
      rule: string[],
      reduction: string
}

export type RToken = {
      $: (PToken | RToken)[],
      type: string
}

export type Token = PToken | RToken