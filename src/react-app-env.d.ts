/// <reference types="react-scripts" />
interface Window {
    gapi: {
      load: (apiName: string, callback: () => void) => void;
      auth2: {
        init: (params: { client_id: string; scope: string }) => Promise<void>;
        getAuthInstance: () => {
          isSignedIn: {
            get: () => boolean;
            listen: (callback: (signedIn: boolean) => void) => void;
          };
          signIn: () => Promise<void>;
          signOut: () => Promise<void>;
        };
      };
    };
  }
