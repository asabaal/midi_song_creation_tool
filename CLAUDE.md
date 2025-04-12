# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Lint/Test Commands
- **Dev (v2)**: `npm run dev` - Start Vite development server
- **Build (v2)**: `npm run build` - Build TypeScript and bundle with Vite
- **Lint (v2)**: `npm run lint` - Run ESLint
- **CRA Dev (v2/midi-song-tool)**: `npm run start` - Start React development server
- **CRA Test (v2/midi-song-tool)**: `npm run test` - Run all tests
- **Single Test**: `npm test -- --testNamePattern="test name here"`

## Architecture
- **Core Stack**: TypeScript with WebAssembly for performance-critical components
- **UI Framework**: React with functional components
- **State Management**: Redux for application state, RxJS for reactive events
- **Performance Strategy**: Identify bottlenecks → Optimize in TypeScript → Move to WebAssembly → C++ migration path
- **Performance Requirements**: <10ms latency, <30% CPU usage, <500MB base memory

## Code Style Guidelines
- **TypeScript**: Strict mode, no unused locals/parameters, no unchecked side effects
- **Components**: Functional components with React.FC type annotation
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Imports**: React first, external libraries next, relative imports, CSS last
- **Types**: Define props using TypeScript interfaces
- **JSX**: Wrap components in parentheses with consistent indentation (2 spaces)
- **Error Handling**: Handle errors at boundaries, provide fallback UI

## Testing Standards
- **Unit Tests**: Jest and React Testing Library
- **Component Tests**: Test files use .test.tsx naming convention
- **Integration Tests**: Cypress for user flows
- **Performance Tests**: Benchmark against defined performance targets
- **Coverage**: Focus on critical paths and core functionality

## Documentation
- **Components**: Document props, behavior, and usage examples
- **Performance Critical Code**: Document optimization approaches and benchmarks
- **WebAssembly Modules**: Document interface and performance characteristics
- **Music Theory**: Document musical concepts and implementation details
- **Algorithms**: Document approach, constraints, and expected output