// Some more dependency classes, with the same name as those in dependencies.ts
// so that we can test name conflicts.

import { DependencyAwareClass } from '@/src';

export class A extends DependencyAwareClass {}

export class ServiceA extends DependencyAwareClass {}
