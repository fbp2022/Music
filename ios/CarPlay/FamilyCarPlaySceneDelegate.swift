import CarPlay
import UIKit

/// CarPlay scene foundation. Integrate into a signed Xcode iOS app only
/// after Apple grants the CarPlay Audio entitlement.
/// This intentionally exposes no fake stations or non-working play actions.
@MainActor
final class FamilyCarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate {
    private var controller: CPInterfaceController?

    func templateApplicationScene(
        _ templateApplicationScene: CPTemplateApplicationScene,
        didConnect interfaceController: CPInterfaceController
    ) {
        controller = interfaceController

        let radio = makePlaceholderTab(
            title: "Radio",
            symbol: "dot.radiowaves.left.and.right"
        )
        let library = makePlaceholderTab(title: "Library", symbol: "music.note.list")
        let playlists = makePlaceholderTab(title: "Playlists", symbol: "list.bullet")

        let root = CPTabBarTemplate(templates: [radio, library, playlists])
        interfaceController.setRootTemplate(root, animated: false, completion: nil)
    }

    func templateApplicationScene(
        _ templateApplicationScene: CPTemplateApplicationScene,
        didDisconnect interfaceController: CPInterfaceController
    ) {
        controller = nil
    }

    private func makePlaceholderTab(title: String, symbol: String) -> CPListTemplate {
        let item = CPListItem(
            text: "Connect your Family Music account",
            detailText: "Favorites and playback will be available after server integration."
        )
        item.isEnabled = false

        let tab = CPListTemplate(
            title: title,
            sections: [CPListSection(items: [item])]
        )
        tab.tabImage = UIImage(systemName: symbol)
        return tab
    }
}
