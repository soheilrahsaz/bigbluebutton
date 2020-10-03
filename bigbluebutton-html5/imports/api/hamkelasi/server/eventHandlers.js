import RedisPubSub from '/imports/startup/server/redis';
import handleRequestHamkelasiAction from './handlers/handleRequestHamkelasiAction';

RedisPubSub.on('RequestHamkelasiActionEvtMsg', handleRequestHamkelasiAction);
