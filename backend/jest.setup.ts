type AnyRecord = Record<string, any>;

type UserRecord = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'sales' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
};

type CustomerRecord = {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  address?: string | null;
  city?: string | null;
  country: string;
  status: 'active' | 'inactive' | 'prospect';
  createdAt: Date;
  updatedAt: Date;
};

type LeadRecord = {
  id: string;
  title: string;
  status: 'new' | 'contacted' | 'proposal' | 'won' | 'lost';
  value: number;
  notes?: string | null;
  customerId: string;
  assignedTo: string;
  closedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type ProductRecord = {
  id: string;
  name: string;
  sku: string;
  description?: string | null;
  category: string;
  price: number;
  stock: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
};

type OrderItemRecord = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type OrderRecord = {
  id: string;
  orderNumber: string;
  customerId: string;
  assignedTo: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const state = {
  users: [] as UserRecord[],
  customers: [] as CustomerRecord[],
  leads: [] as LeadRecord[],
  products: [] as ProductRecord[],
  orders: [] as OrderRecord[],
  orderItems: [] as OrderItemRecord[],
};

let nextIdValue = 1;

function nextId(prefix: string): string {
  nextIdValue += 1;
  return `${prefix}_${nextIdValue}`;
}

function now(): Date {
  return new Date();
}

function clone<T>(value: T): T {
  return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function isObject(value: unknown): value is AnyRecord {
  return typeof value === 'object' && value !== null;
}

function compareValues(left: unknown, right: unknown): number {
  if (left === right) return 0;
  if (left === undefined || left === null) return -1;
  if (right === undefined || right === null) return 1;
  if (left instanceof Date || right instanceof Date) {
    return new Date(left as string | number | Date).getTime() - new Date(right as string | number | Date).getTime();
  }
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  return String(left).localeCompare(String(right));
}

function matchesScalarCondition(value: unknown, condition: unknown): boolean {
  if (!isObject(condition)) {
    return value === condition;
  }

  if ('contains' in condition) {
    if (typeof value !== 'string') return false;
    const needle = String(condition.contains);
    const haystack = condition.mode === 'insensitive' ? value.toLowerCase() : value;
    return haystack.includes(condition.mode === 'insensitive' ? needle.toLowerCase() : needle);
  }

  if ('in' in condition && Array.isArray(condition.in)) {
    return condition.in.includes(value);
  }

  if ('gte' in condition) {
    return compareValues(value, condition.gte) >= 0;
  }

  if ('lte' in condition) {
    return compareValues(value, condition.lte) <= 0;
  }

  if ('not' in condition) {
    return !matchesScalarCondition(value, condition.not);
  }

  return Object.entries(condition).every(([key, nested]) => {
    if (key === 'mode') return true;
    if (value === undefined || value === null) return false;
    return matchesScalarCondition((value as AnyRecord)[key], nested);
  });
}

function matchesWhere(record: AnyRecord, where: AnyRecord = {}): boolean {
  if (!where || Object.keys(where).length === 0) return true;

  if (Array.isArray(where.OR) && !where.OR.some((entry: AnyRecord) => matchesWhere(record, entry))) {
    return false;
  }

  if (Array.isArray(where.AND) && !where.AND.every((entry: AnyRecord) => matchesWhere(record, entry))) {
    return false;
  }

  if (where.NOT && matchesWhere(record, where.NOT)) {
    return false;
  }

  return Object.entries(where).every(([key, condition]) => {
    if (key === 'OR' || key === 'AND' || key === 'NOT') return true;
    return matchesScalarCondition(record[key], condition);
  });
}

function applySelect<T extends AnyRecord>(record: T, select?: AnyRecord): AnyRecord {
  if (!select) return clone(record);
  const result: AnyRecord = {};
  for (const [key, enabled] of Object.entries(select)) {
    if (enabled) result[key] = clone(record[key]);
  }
  return result;
}

function getCustomerCounts(customerId: string) {
  return {
    leads: state.leads.filter((lead) => lead.customerId === customerId).length,
    orders: state.orders.filter((order) => order.customerId === customerId).length,
  };
}

function getLeadCustomer(lead: LeadRecord) {
  return state.customers.find((customer) => customer.id === lead.customerId) || null;
}

function getLeadAssignee(lead: LeadRecord) {
  return state.users.find((user) => user.id === lead.assignedTo) || null;
}

function getOrderCustomer(order: OrderRecord) {
  return state.customers.find((customer) => customer.id === order.customerId) || null;
}

function getOrderAssignee(order: OrderRecord) {
  return state.users.find((user) => user.id === order.assignedTo) || null;
}

function getOrderItems(orderId: string) {
  return state.orderItems.filter((item) => item.orderId === orderId);
}

function includeCustomerRelations(customer: CustomerRecord, include?: AnyRecord) {
  const result: AnyRecord = clone(customer);
  if (include?._count) {
    result._count = getCustomerCounts(customer.id);
  }
  if (include?.leads) {
    const relation = state.leads
      .filter((lead) => lead.customerId === customer.id)
      .sort((left, right) => compareValues(right.createdAt, left.createdAt));
    const limited = typeof include.leads === 'object' && include.leads?.take ? relation.slice(0, include.leads.take) : relation;
    result.leads = limited.map((lead) => clone(lead));
  }
  if (include?.orders) {
    const relation = state.orders
      .filter((order) => order.customerId === customer.id)
      .sort((left, right) => compareValues(right.createdAt, left.createdAt));
    const limited = typeof include.orders === 'object' && include.orders?.take ? relation.slice(0, include.orders.take) : relation;
    result.orders = limited.map((order) => clone(order));
  }
  return result;
}

function includeLeadRelations(lead: LeadRecord, include?: AnyRecord) {
  const result: AnyRecord = clone(lead);
  if (include?.customer) {
    const customer = getLeadCustomer(lead);
    result.customer = include.customer.select ? applySelect(customer as AnyRecord, include.customer.select) : clone(customer);
  }
  if (include?.assignee) {
    const assignee = getLeadAssignee(lead);
    result.assignee = include.assignee.select ? applySelect(assignee as AnyRecord, include.assignee.select) : clone(assignee);
  }
  return result;
}

function includeOrderRelations(order: OrderRecord, include?: AnyRecord) {
  const result: AnyRecord = clone(order);
  if (include?.customer) {
    const customer = getOrderCustomer(order);
    result.customer = include.customer.select ? applySelect(customer as AnyRecord, include.customer.select) : clone(customer);
  }
  if (include?.assignee) {
    const assignee = getOrderAssignee(order);
    result.assignee = include.assignee.select ? applySelect(assignee as AnyRecord, include.assignee.select) : clone(assignee);
  }
  if (include?.items) {
    const relation = getOrderItems(order.id).map((item) => {
      const mapped: AnyRecord = clone(item);
      if (include.items.include?.product) {
        const product = state.products.find((entry) => entry.id === item.productId) || null;
        mapped.product = include.items.include.product.select ? applySelect(product as AnyRecord, include.items.include.product.select) : clone(product);
      }
      return mapped;
    });
    result.items = relation;
  }
  return result;
}

function includeProductRelations(product: ProductRecord, include?: AnyRecord) {
  return clone(product);
}

function includeUserRelations(user: UserRecord, include?: AnyRecord) {
  return clone(user);
}

function applyModelSelectAndInclude(record: AnyRecord, options: AnyRecord | undefined, model: string): AnyRecord {
  let result: AnyRecord = clone(record);

  if (model === 'customer') {
    result = includeCustomerRelations(record as CustomerRecord, options?.include);
  } else if (model === 'lead') {
    result = includeLeadRelations(record as LeadRecord, options?.include);
  } else if (model === 'order') {
    result = includeOrderRelations(record as OrderRecord, options?.include);
  } else if (model === 'product') {
    result = includeProductRelations(record as ProductRecord, options?.include);
  } else if (model === 'user') {
    result = includeUserRelations(record as UserRecord, options?.include);
  }

  if (options?.select) {
    return applySelect(result, options.select) as AnyRecord;
  }

  return result;
}

function sortRecords<T extends AnyRecord>(records: T[], orderBy?: AnyRecord, model?: string): T[] {
  if (!orderBy) return records;
  const [[key, value]] = Object.entries(orderBy);
  const direction = typeof value === 'string' ? value : Object.values(value as AnyRecord)[0];

  return [...records].sort((left, right) => {
    let leftValue: unknown = left[key];
    let rightValue: unknown = right[key];

    if (model === 'customer' && key === 'orders' && isObject(value) && '_count' in value) {
      leftValue = state.orders.filter((order) => order.customerId === left.id).length;
      rightValue = state.orders.filter((order) => order.customerId === right.id).length;
    }

    const comparison = compareValues(leftValue, rightValue);
    return direction === 'desc' ? -comparison : comparison;
  });
}

function uniqueBy<T extends AnyRecord>(records: T[], distinct?: string[]): T[] {
  if (!distinct?.length) return records;
  const seen = new Set<string>();
  return records.filter((record) => {
    const key = JSON.stringify(distinct.map((field) => record[field]));
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function paginate<T>(records: T[], skip = 0, take?: number): T[] {
  const sliced = records.slice(skip);
  return typeof take === 'number' ? sliced.slice(0, take) : sliced;
}

function throwUniqueConstraint(): never {
  throw Object.assign(new Error('Unique constraint failed'), { code: 'P2002' });
}

function throwNotFound(): never {
  throw Object.assign(new Error('Record not found'), { code: 'P2025' });
}

function createModelHandlers(model: 'user' | 'customer' | 'lead' | 'product' | 'order') {
  const store = state[`${model}s` as keyof typeof state] as AnyRecord[];

  const findUnique = (args: AnyRecord) => store.find((record) => matchesWhere(record, args?.where)) ?? null;
  const findFirst = (args: AnyRecord) => store.find((record) => matchesWhere(record, args?.where)) ?? null;

  return {
    findUnique: async (args: AnyRecord = {}) => {
      const record = findUnique(args);
      return record ? applyModelSelectAndInclude(record, args, model) : null;
    },
    findFirst: async (args: AnyRecord = {}) => {
      const record = findFirst(args);
      return record ? applyModelSelectAndInclude(record, args, model) : null;
    },
    findMany: async (args: AnyRecord = {}) => {
      const filtered = store.filter((record) => matchesWhere(record, args.where));
      const distinct = uniqueBy(filtered, args.distinct);
      const sorted = sortRecords(distinct, args.orderBy, model);
      const paginated = paginate(sorted, args.skip || 0, args.take);
      return paginated.map((record) => applyModelSelectAndInclude(record, args, model));
    },
    count: async (args: AnyRecord = {}) => store.filter((record) => matchesWhere(record, args.where)).length,
    deleteMany: async (args: AnyRecord = {}) => {
      const remaining = store.filter((record) => !matchesWhere(record, args.where));
      const deleted = store.length - remaining.length;
      store.splice(0, store.length, ...remaining);
      return { count: deleted };
    },
    update: async (args: AnyRecord) => {
      const index = store.findIndex((record) => matchesWhere(record, args.where));
      if (index === -1) throwNotFound();
      const current = store[index];
      const next = { ...current, ...args.data, updatedAt: now() };
      if (model === 'user' && args.data?.email && store.some((record) => record.email === args.data.email && record.id !== current.id)) {
        throwUniqueConstraint();
      }
      if (model === 'customer' && args.data?.email && store.some((record) => record.email === args.data.email && record.id !== current.id)) {
        throwUniqueConstraint();
      }
      if (model === 'product' && args.data?.sku && store.some((record) => record.sku === args.data.sku && record.id !== current.id)) {
        throwUniqueConstraint();
      }
      store[index] = next;
      return applyModelSelectAndInclude(next, args, model);
    },
    delete: async (args: AnyRecord) => {
      const index = store.findIndex((record) => matchesWhere(record, args.where));
      if (index === -1) throwNotFound();
      const [removed] = store.splice(index, 1);
      if (model === 'customer') {
        state.leads = state.leads.filter((lead) => lead.customerId !== removed.id);
        state.orders = state.orders.filter((order) => order.customerId !== removed.id);
        state.orderItems = state.orderItems.filter((item) => state.orders.some((order) => order.id === item.orderId));
      }
      if (model === 'order') {
        state.orderItems = state.orderItems.filter((item) => item.orderId !== removed.id);
      }
      return applyModelSelectAndInclude(removed, args, model);
    },
    upsert: async (args: AnyRecord) => {
      const existing = findUnique({ where: args.where });
      if (existing) {
        const updated = { ...existing, ...args.update, updatedAt: now() };
        const index = store.findIndex((record) => record.id === existing.id);
        store[index] = updated;
        return applyModelSelectAndInclude(updated, args, model);
      }
      return create(model, args.create);
    },
  };
}

function createUser(data: AnyRecord) {
  if (state.users.some((user) => user.email === data.email)) throwUniqueConstraint();
  const record: UserRecord = {
    id: nextId('user'),
    email: data.email,
    password: data.password,
    name: data.name,
    role: data.role || 'sales',
    createdAt: now(),
    updatedAt: now(),
  };
  state.users.push(record);
  return record;
}

function createCustomer(data: AnyRecord) {
  if (state.customers.some((customer) => customer.email === data.email)) throwUniqueConstraint();
  const record: CustomerRecord = {
    id: nextId('customer'),
    companyName: data.companyName,
    contactName: data.contactName,
    phone: data.phone,
    email: data.email,
    address: data.address ?? null,
    city: data.city ?? null,
    country: data.country || 'Uzbekistan',
    status: data.status || 'prospect',
    createdAt: now(),
    updatedAt: now(),
  };
  state.customers.push(record);
  return record;
}

function createLead(data: AnyRecord) {
  const record: LeadRecord = {
    id: nextId('lead'),
    title: data.title,
    status: data.status || 'new',
    value: Number(data.value ?? 0),
    notes: data.notes ?? null,
    customerId: data.customerId,
    assignedTo: data.assignedTo,
    closedAt: data.closedAt ? new Date(data.closedAt) : null,
    createdAt: now(),
    updatedAt: now(),
  };
  state.leads.push(record);
  return record;
}

function createProduct(data: AnyRecord) {
  if (state.products.some((product) => product.sku === data.sku)) throwUniqueConstraint();
  const record: ProductRecord = {
    id: nextId('product'),
    name: data.name,
    sku: data.sku,
    description: data.description ?? null,
    category: data.category,
    price: Number(data.price),
    stock: Number(data.stock ?? 0),
    unit: data.unit || 'pcs',
    createdAt: now(),
    updatedAt: now(),
  };
  state.products.push(record);
  return record;
}

function createOrder(data: AnyRecord) {
  if (state.orders.some((order) => order.orderNumber === data.orderNumber)) throwUniqueConstraint();
  const record: OrderRecord = {
    id: nextId('order'),
    orderNumber: data.orderNumber,
    customerId: data.customerId,
    assignedTo: data.assignedTo,
    status: data.status || 'pending',
    totalAmount: Number(data.totalAmount ?? 0),
    notes: data.notes ?? null,
    createdAt: now(),
    updatedAt: now(),
  };
  state.orders.push(record);

  const items = Array.isArray(data.items?.create) ? data.items.create : [];
  for (const item of items) {
    state.orderItems.push({
      id: nextId('orderItem'),
      orderId: record.id,
      productId: item.productId,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
    });
  }

  return record;
}

function create(model: 'user' | 'customer' | 'lead' | 'product' | 'order', data: AnyRecord) {
  switch (model) {
    case 'user':
      return createUser(data);
    case 'customer':
      return createCustomer(data);
    case 'lead':
      return createLead(data);
    case 'product':
      return createProduct(data);
    case 'order':
      return createOrder(data);
  }
}

function aggregateOrders(args: AnyRecord = {}) {
  const rows = state.orders.filter((order) => matchesWhere(order, args.where));
  const totalAmount = rows.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  return { _sum: { totalAmount } };
}

function groupLeads(args: AnyRecord = {}) {
  const field = args.by?.[0] || 'status';
  const rows = state.leads.filter((lead) => matchesWhere(lead, args.where));
  const buckets = new Map<string, LeadRecord[]>();
  for (const row of rows) {
    const key = String((row as AnyRecord)[field]);
    const bucket = buckets.get(key) || [];
    bucket.push(row);
    buckets.set(key, bucket);
  }
  return Array.from(buckets.entries()).map(([key, bucket]) => ({
    [field]: key,
    _count: { [field]: bucket.length },
    _sum: { value: bucket.reduce((sum, lead) => sum + Number(lead.value || 0), 0) },
  }));
}

class MockPrismaClient {
  user = {
    ...createModelHandlers('user'),
    create: async ({ data, select }: AnyRecord = {}) => applySelect(create('user', data), select),
  };

  customer = {
    ...createModelHandlers('customer'),
    create: async ({ data, select }: AnyRecord = {}) => applySelect(create('customer', data), select),
  };

  lead = {
    ...createModelHandlers('lead'),
    create: async ({ data, include, select }: AnyRecord = {}) => applyModelSelectAndInclude(create('lead', data), { include, select }, 'lead'),
    createMany: async ({ data, skipDuplicates }: AnyRecord = {}) => {
      let count = 0;
      for (const entry of data || []) {
        try {
          create('lead', entry);
          count += 1;
        } catch (error) {
          if (!skipDuplicates) throw error;
        }
      }
      return { count };
    },
    groupBy: async (args: AnyRecord = {}) => groupLeads(args),
  };

  product = {
    ...createModelHandlers('product'),
    create: async ({ data, select }: AnyRecord = {}) => applySelect(create('product', data), select),
  };

  order = {
    ...createModelHandlers('order'),
    create: async ({ data, include, select }: AnyRecord = {}) => {
      const created = create('order', data);
      return applyModelSelectAndInclude(created, { include, select }, 'order');
    },
    aggregate: async (args: AnyRecord = {}) => aggregateOrders(args),
  };

  $queryRaw = async () => [];
  $disconnect = async () => undefined;
  $connect = async () => undefined;
  $transaction = async (operations: Array<Promise<unknown>>) => Promise.all(operations);
}

jest.mock('@prisma/client', () => ({
  PrismaClient: MockPrismaClient,
  Role: { admin: 'admin', sales: 'sales', viewer: 'viewer' },
  LeadStatus: { new: 'new', contacted: 'contacted', proposal: 'proposal', won: 'won', lost: 'lost' },
  CustomerStatus: { active: 'active', inactive: 'inactive', prospect: 'prospect' },
  OrderStatus: { pending: 'pending', confirmed: 'confirmed', shipped: 'shipped', delivered: 'delivered', cancelled: 'cancelled' },
}));
