# Node-RED Contrib Modbus Documentation

Welcome to the comprehensive documentation for node-red-contrib-modbus. This directory contains all technical documentation, guides, and specifications for the project.

## 📚 Documentation Structure

### [API Documentation](./api/)
- **[API Specification](./api/API_SPECIFICATION.md)** - Complete API reference for all Modbus nodes
  - Node configurations
  - Message formats
  - Function codes
  - Response handling

### [Architecture](./architecture/)
- **[System Architecture](./architecture/ARCHITECTURE.md)** - Overall system design and structure
  - Component overview
  - Data flow diagrams
  - State management
  - Connection pooling

### [Development](./development/)
- **[Implementation Guide](./development/IMPLEMENTATION_GUIDE.md)** - How to implement new features
- **[Improvement Plan](./development/IMPROVEMENT_PLAN.md)** - Roadmap and planned enhancements
- **[Enhancements](./development/ENHANCEMENTS.md)** - Recent improvements and features
- **[TLS Nodes Documentation](./development/TLS_NODES_DOCUMENTATION.md)** - TLS/SSL implementation details
- **[Modbus Serial Fixes](./development/MODBUS_SERIAL_FIXES.md)** - Serial communication improvements
- **[Modbus Serial Merge Strategy](./development/MODBUS_SERIAL_MERGE_STRATEGY.md)** - Integration strategies

### [Security](./security/)
- **[Security Guide](./security/README.md)** - Comprehensive security documentation
  - Security policy
  - TLS/SSL configuration
  - Best practices
  - Vulnerability reporting

### [Testing](./testing/)
- **[Testing Plan](./testing/TESTING_PLAN.md)** - Overall testing strategy
- **[Current Test Status](./testing/CURRENT_TEST_STATUS.md)** - Latest test execution results
- **[Coverage Report](./testing/COVERAGE_REPORT.md)** - Code coverage analysis
- **[Coverage Improvement](./testing/COVERAGE_IMPROVEMENT.md)** - Coverage enhancement efforts

### General Documentation
- **[History](./HISTORY.md)** - Project history and changelog
- **[TODO](./TODO.md)** - Pending tasks and future work

## 🚀 Quick Start Guides

### For Users
1. Start with the [API Specification](./api/API_SPECIFICATION.md) to understand available nodes
2. Review [Security Guide](./security/README.md) for production deployments
3. Check [Architecture](./architecture/ARCHITECTURE.md) for system understanding

### For Developers
1. Read the [Implementation Guide](./development/IMPLEMENTATION_GUIDE.md)
2. Review [Testing Plan](./testing/TESTING_PLAN.md) for quality assurance
3. Check [TODO](./TODO.md) for contribution opportunities

### For Security Auditors
1. Review [Security Guide](./security/README.md)
2. Check [TLS Documentation](./development/TLS_NODES_DOCUMENTATION.md)
3. Examine test coverage in [Coverage Report](./testing/COVERAGE_REPORT.md)

## 📊 Project Status

### Current Version
- **Version**: 6.0.0-beta.1
- **Node-RED Compatibility**: 4.x
- **Node.js**: 18.x, 20.x

### Test Coverage
- **Current Coverage**: ~45%
- **Target Coverage**: 85%
- **Status**: Active improvement (see [Coverage Improvement](./testing/COVERAGE_IMPROVEMENT.md))

### Security
- **TLS Support**: ✅ Full TLS 1.2/1.3 support
- **Authentication**: ✅ Via Node-RED
- **Audit**: Regular security updates

## 🔍 Finding Information

### By Topic
- **Modbus TCP**: See API Specification and Architecture
- **Modbus Serial**: See Modbus Serial documentation in Development
- **TLS/SSL**: See TLS Nodes Documentation and Security Guide
- **Testing**: See Testing directory
- **Performance**: See Architecture and Improvement Plan

### By Node Type
- **modbus-client**: API Specification, Architecture
- **modbus-server**: API Specification, Security Guide
- **modbus-read/write**: API Specification
- **modbus-flex-***: API Specification, Implementation Guide
- **TLS nodes**: TLS Documentation, Security Guide

## 🤝 Contributing

Before contributing, please review:
1. [Implementation Guide](./development/IMPLEMENTATION_GUIDE.md)
2. [Testing Plan](./testing/TESTING_PLAN.md)
3. [TODO List](./TODO.md)

## 📝 Documentation Standards

### File Naming
- Use UPPERCASE for primary documents (README.md, TODO.md)
- Use descriptive names with underscores for separation
- Keep names concise but clear

### Content Structure
1. Clear heading hierarchy
2. Code examples where applicable
3. Tables for structured data
4. Links to related documents

### Maintenance
- Regular updates with version changes
- Timestamp on significant updates
- Clear deprecation notices

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/biancoroyal/node-red-contrib-modbus/issues)
- **Discussions**: [GitHub Discussions](https://github.com/biancoroyal/node-red-contrib-modbus/discussions)
- **Security**: See [Security Guide](./security/README.md) for reporting vulnerabilities

---

*Last Updated: 2024-08*
*Documentation Version: 1.0*