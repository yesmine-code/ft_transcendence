interface Tools {
  setStatus?: (status: number) => void;
  temporary: {
    status: number;
  };
}

interface Headers extends Record<string, any> {
  "x-csrf-token": string;
}

interface FormErrorInterface {
  code: number;
  message: Record<string, any>;
}

export class FormError {
  constructor(public code: number, public message: Record<string, any>) {}
}

export default ((tools: Tools) => {
  const url = (uri: string) => new URL(uri, "http://127.0.0.1:4000").href;

  const headers: Headers = {
    "x-csrf-token": window._ft_init.token,
  };

  return {
    define: {
      ...(tools.setStatus
        ? {}
        : {
            setStatus: (fct: (status: number) => void) => {
              if (!tools.setStatus) {
                tools.setStatus = fct;
                tools.setStatus(tools.temporary.status);
              }
            },
          }),
    },
    headers: {
      set: (key: string, value: string | number): void => {
        headers[key] = String(value);
      },
    },
    request: {
      json: async <T = Record<string, any>>(
        uri: string,
        body: { [x: string | number]: any } = {}
      ): Promise<T> => {
        const response = await fetch(url(uri), {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify(body),
        });

        if (response.redirected) window.location.href = response.url;

        if (!tools.setStatus) {
          tools.temporary.status = response.status;
        } else {
          tools.setStatus(response.status);
        }

	   const contentType = response.headers.get("content-type");
        const data =
          contentType && contentType.indexOf("application/json") === -1
            ? null
            : await response.json();

        if ((data as FormErrorInterface).code == 422)
          throw new FormError(
            (data as FormErrorInterface).code,
            (data as FormErrorInterface).message
          );

        return data;
      },
      form: async <T = Record<string, any>>(
        uri: string,
        body: { [x: string | number]: any } = {}
      ): Promise<T> => {
        const value = new FormData();

        Object.entries(body).forEach(([k, v]) => {
          value.append(k, v as string);
        });

        const response = await fetch(url(uri), {
          method: "POST",
          headers,
          credentials: "include",
          body: value,
        });

        if (response.redirected) window.location.href = response.url;

        if (!tools.setStatus) {
          tools.temporary.status = response.status;
        } else {
          tools.setStatus(response.status);
        }

        const contentType = response.headers.get("content-type");
        const data =
          contentType && contentType.indexOf("application/json") === -1
            ? null
            : await response.json();

        if ((data as FormErrorInterface).code == 422)
          throw new FormError(
            (data as FormErrorInterface).code,
            (data as FormErrorInterface).message
          );

        return data;
      },
    },
  };
})({
  temporary: {
    status: 200,
  },
});
