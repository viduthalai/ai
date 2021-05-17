FROM dockreg-ext.use.dom.carezen.net/dockerhub/node:8

WORKDIR /poppins
COPY package.json  /poppins/
RUN npm install

COPY . /poppins

COPY ombiance /ombiance
RUN chmod a+x /ombiance

ENTRYPOINT ["/ombiance"]
RUN npm run build
CMD ["npm", "start"]

HEALTHCHECK --interval=10s --timeout=5s CMD curl --fail http://localhost:8000 || exit 1 
