# Changelog

All notable changes to the shared library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup and documentation

## [1.1.0] - 2025-01-XX

### Added
- `NewMemberJoinedData` interface for new member join notifications
- `user:new-member-joined` Socket.io event type definition
- Comprehensive API change documentation
- Client migration guide for Socket.io event updates
- Release notes with detailed upgrade instructions

### Changed
- Enhanced user information synchronization in Socket.io events
- Improved data consistency for multi-user scenarios
- `user:joined` event now only handles self-login confirmation
- Separated concerns between self-login and new member notifications

### Fixed
- **CRITICAL**: User information synchronization issue when multiple users login simultaneously
- Socket.io event data completeness for user join notifications
- User identity confusion in multi-user chat scenarios

### Documentation
- Updated Socket.io event documentation
- Added migration guide for client developers
- Enhanced TypeScript type definitions with usage examples

## [1.0.0] - 2025-01-XX

### Added
- Core type definitions for User, Message, Socket events, and API responses
- Comprehensive constant definitions for events, errors, and configuration
- Validation functions for user and message data
- Complete API specification documentation
- Socket.io event protocol documentation
- Data model specification
- Development workflow documentation

### Features
- **Types**: Complete TypeScript type definitions for all data models
- **Constants**: Centralized event names, error codes, and configuration values
- **Validators**: Shared validation logic for both client and server
- **Documentation**: Comprehensive API and protocol documentation

### Technical Specifications
- **API Version**: v1
- **Socket.io**: 4.7+ compatibility
- **TypeScript**: 5.3+ support
- **Node.js**: 20+ compatibility

### Breaking Changes
- This is the initial release, no breaking changes

### Security
- Input validation for all user data
- XSS protection in message content
- File type and size validation
- Rate limiting constants defined

---

## Version History

### Version Numbering
- **Major** (X.0.0): Breaking changes that require updates to both client and server
- **Minor** (0.X.0): New features that are backward compatible
- **Patch** (0.0.X): Bug fixes and small improvements

### Supported Versions
- **1.x.x**: Current stable version with active support
- **0.x.x**: Development versions (deprecated)

### Upgrade Guide
When upgrading to a new version:

1. Check the breaking changes section
2. Update import statements if needed
3. Run tests to ensure compatibility
4. Update both client and server projects simultaneously

### Deprecation Policy
- Features marked as deprecated will be removed in the next major version
- Deprecation warnings will be added at least one minor version before removal
- Migration guides will be provided for all breaking changes

---

## Contributing

To contribute to this shared library:

1. Create a feature branch from `main`
2. Make your changes and add tests
3. Update this CHANGELOG.md
4. Ensure both client and server projects still compile
5. Submit a pull request

### Change Categories
- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements