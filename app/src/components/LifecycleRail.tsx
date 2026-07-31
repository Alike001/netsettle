import type { LifecycleItem } from '../lib/round';
import { Icon } from './Icon';
import type { IconName } from './Icon';

const icons: Record<LifecycleItem['key'], IconName> = {
  fund: 'fund',
  submit: 'submit',
  compute: 'refresh',
  settle: 'settle',
  withdraw: 'withdraw',
};

export function LifecycleRail({ items }: { items: LifecycleItem[] }) {
  return (
    <section className="lifecycle-card" aria-labelledby="lifecycle-heading">
      <div className="section-heading lifecycle-heading">
        <div>
          <p className="eyebrow">Round progress</p>
          <h2 id="lifecycle-heading">Lifecycle</h2>
        </div>
        <span className="muted">Reload-safe chain state</span>
      </div>
      <ol className="lifecycle-list">
        {items.map((item, index) => (
          <li className={`lifecycle-item lifecycle-${item.state}`} key={item.key}>
            <span className="lifecycle-icon">
              {item.state === 'complete' ? <Icon name="check" /> : <Icon name={icons[item.key]} />}
            </span>
            <div>
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
            </div>
            {index < items.length - 1 && <span className="lifecycle-line" />}
          </li>
        ))}
      </ol>
    </section>
  );
}
