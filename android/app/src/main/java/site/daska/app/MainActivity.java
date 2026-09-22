package site.daska.app;

import android.graphics.Color;
import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Android 15+ forces edge-to-edge regardless of what we ask for, and
        // setStatusBarColor()/setNavigationBarColor() are silently ignored
        // once the app targets that API level. So instead of fighting it,
        // embrace it: make both bars fully transparent so the WebView's own
        // dark background shows through everywhere, and rely on the web
        // page's own safe-area CSS to keep header content clear of the
        // notch/status bar and the gesture bar.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        super.onCreate(savedInstanceState);

        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);

        // Dark background behind the bars needs light (not dark) status/nav
        // bar icons to stay visible.
        WindowInsetsControllerCompat controller =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.setAppearanceLightStatusBars(false);
        controller.setAppearanceLightNavigationBars(false);
    }
}