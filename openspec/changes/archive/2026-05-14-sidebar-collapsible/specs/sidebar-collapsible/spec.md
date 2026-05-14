## ADDED Requirements

### Requirement: Sidebar collapses automatically on small viewports

The sidebar SHALL automatically collapse from expanded state (256px width) to collapsed state (64px width) when the viewport width is less than 1024px. The sidebar SHALL automatically expand when the viewport width is 1024px or greater.

### Requirement: Smooth transition animation

The sidebar SHALL transition between expanded and collapsed states using a smooth animation with a duration of 300ms and ease-in-out timing.

### Requirement: Collapsed state displays icon rail

When collapsed, the sidebar SHALL display only icons without text labels. The logo SHALL display only the "IA" initials, and navigation items SHALL display only their icons.

### Requirement: Logo click expands sidebar

When the sidebar is in collapsed state, clicking the "IA" logo SHALL expand the sidebar to its full width.

### Requirement: Profile dropdown in collapsed mode

When the sidebar is collapsed, clicking the user avatar SHALL open a DropdownMenu containing:
- User name and role display
- "Ver Perfil" option
- Text size selector (Pequeño, Mediano, Grande)
- "Cerrar Sesión" option

### Requirement: Profile section in expanded mode

When the sidebar is expanded, the profile section SHALL remain as currently implemented with the user avatar, name, role, and a dropdown for profile options.

### Requirement: User text size preference is maintained

The system SHALL maintain the user's text size preference (small, medium, large) regardless of sidebar collapse state. Text size selection via the profile dropdown SHALL work identically in both expanded and collapsed modes.

### Requirement: Logout functionality

The logout action SHALL be accessible from the profile dropdown in both expanded and collapsed sidebar modes. The logout process SHALL clear the local storage token and navigate to the login page.