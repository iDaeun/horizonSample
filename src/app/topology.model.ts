export class TopologyModel {
  servers: Server[];
  networks: Network[];
  ports: Port[];
  routers: Router[];
}

export class Server {
  console: string;
  id: string;
  name: string;
  original_status: string;
  status: string;
  task: string;
  url: string;
}

export class Network {
  allow_delete_subnet: string;
  id: string;
  name: string;
  original_status: string;
  router: string;
  status: string;
  subnets: Subnet[];
  url: string;
}

export class Subnet {
  id: string;
  cidr: string;
  url: string;
}

export class Port {
  device_id: string;
  device_owner: string;
  fixed_ips: Ip[];
  id: string;
  network_id: string;
  original_status: string;
  status: string;
  url: string;
}

export class Ip {
  subnet_id: string;
  ip_address: string;
}

export class Router {
  id: string;
  name: string;
  status: string;
  original_status: string;
  external_gateway_info: Gateway;
  url: string;
}

export class Gateway {
  network_id: string;
  enable_snat: boolean;
  external_fixed_ips: Ip[];
}
